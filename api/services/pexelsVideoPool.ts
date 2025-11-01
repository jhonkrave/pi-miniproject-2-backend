/**
 * @fileoverview Pexels Video Pool Service
 * @description Manages a pool of Pexels videos stored in database to avoid rate limiting
 * @author Team 8
 * @version 1.0.0
 */

import { createClient } from "pexels";
import PexelsVideo, { IPexelsVideo } from '../models/PexelsVideo';

/**
 * Pexels client instance
 */
const client = createClient(process.env.PEXELS_API_KEY as string);

/**
 * Minimum number of videos required in pool
 */
const MIN_POOL_SIZE = 100;

/**
 * Maximum pool size (prevents database bloat)
 */
const MAX_POOL_SIZE = 500;

/**
 * Flag to prevent concurrent pool initializations
 */
let isInitializing = false;
let initializationPromise: Promise<number> | null = null;

/**
 * Check if video pool has minimum required videos
 * @returns {Promise<boolean>} True if pool has enough videos
 */
export async function hasMinimumPoolSize(): Promise<boolean> {
    try {
        const count = await PexelsVideo.countDocuments();
        return count >= MIN_POOL_SIZE;
    } catch (error) {
        console.error('Error checking pool size:', error);
        return false;
    }
}

/**
 * Get all videos from pool
 * @returns {Promise<IPexelsVideo[]>} Array of video documents
 */
export async function getAllVideosFromPool(): Promise<IPexelsVideo[]> {
    try {
        return await PexelsVideo.find({}).lean().exec();
    } catch (error) {
        console.error('Error fetching videos from pool:', error);
        return [];
    }
}

/**
 * Add video to pool if it doesn't exist
 * @param {any} videoData - Pexels video data object
 * @returns {Promise<IPexelsVideo | null>} Created video document or null if already exists
 */
export async function addVideoToPool(videoData: any): Promise<IPexelsVideo | null> {
    try {
        if (!videoData || !videoData.id) {
            return null;
        }

        // Check if video already exists
        const existing = await PexelsVideo.findOne({ pexelsId: videoData.id });
        if (existing) {
            return existing;
        }

        // Create new video document
        const video = new PexelsVideo({
            pexelsId: videoData.id,
            videoData: videoData
        });

        return await video.save();
    } catch (error) {
        // Handle duplicate key error gracefully
        if ((error as any)?.code === 11000) {
            return await PexelsVideo.findOne({ pexelsId: videoData.id });
        }
        console.error('Error adding video to pool:', error);
        return null;
    }
}

/**
 * Initialize video pool by fetching videos from Pexels
 * This should be called periodically or on server start
 * Prevents concurrent initializations using a singleton pattern
 * @returns {Promise<number>} Number of videos in pool after initialization
 */
export async function initializeVideoPool(): Promise<number> {
    // If already initializing, return the existing promise
    if (isInitializing && initializationPromise) {
        return initializationPromise;
    }

    // Check current count first
    const currentCount = await PexelsVideo.countDocuments();
    
    // If we already have enough videos, skip initialization
    if (currentCount >= MIN_POOL_SIZE) {
        return currentCount;
    }

    // Set flag and create promise
    isInitializing = true;
    initializationPromise = (async () => {
        try {
            const countBefore = await PexelsVideo.countDocuments();
            
            // Double-check after acquiring lock (another process might have filled it)
            if (countBefore >= MIN_POOL_SIZE) {
                isInitializing = false;
                initializationPromise = null;
                return countBefore;
            }

            console.log(`Initializing video pool (current: ${countBefore}, target: ${MIN_POOL_SIZE})...`);

            const genericQueries = ['cinematic', 'movie', 'film', 'trailer'];
            const addedVideos: number[] = [];
            
            // Fetch videos from Pexels
            for (const query of genericQueries) {
                if (addedVideos.length >= MIN_POOL_SIZE) {
                    break;
                }

                try {
                    // Add delay to avoid rate limiting
                    if (addedVideos.length > 0) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
                    }

                    const response = await client.videos.search({
                        query: query,
                        per_page: 30,
                        page: 1
                    });

                    if ((response as any)?.videos?.length) {
                        for (const video of (response as any).videos) {
                            if (addedVideos.length >= MIN_POOL_SIZE) {
                                break;
                            }
                            
                            const saved = await addVideoToPool(video);
                            if (saved && !addedVideos.includes(video.id)) {
                                addedVideos.push(video.id);
                            }
                        }
                    }
                } catch (error: any) {
                    console.warn(`Failed to fetch videos for query "${query}":`, error.message);
                    // Continue with next query
                    continue;
                }
            }

            const finalCount = await PexelsVideo.countDocuments();
            console.log(`Video pool initialized: ${finalCount} videos available`);
            
            return finalCount;
        } catch (error) {
            console.error('Error initializing video pool:', error);
            return await PexelsVideo.countDocuments();
        } finally {
            // Reset flag and promise
            isInitializing = false;
            initializationPromise = null;
        }
    })();

    return initializationPromise;
}

/**
 * Refresh video pool by adding new videos
 * Can be called periodically to keep pool fresh
 * @returns {Promise<number>} Number of new videos added
 */
export async function refreshVideoPool(): Promise<number> {
    try {
        const currentCount = await PexelsVideo.countDocuments();
        
        // If pool is at max size, remove oldest videos first
        if (currentCount >= MAX_POOL_SIZE) {
            const toRemove = currentCount - MAX_POOL_SIZE + 50; // Remove old ones, keep 50 new slots
            const oldest = await PexelsVideo.find({})
                .sort({ createdAt: 1 })
                .limit(toRemove)
                .exec();
            
            for (const video of oldest) {
                await PexelsVideo.deleteOne({ _id: video._id });
            }
            
            console.log(`Removed ${toRemove} old videos from pool`);
        }

        const beforeCount = await PexelsVideo.countDocuments();
        await initializeVideoPool();
        const afterCount = await PexelsVideo.countDocuments();
        
        return afterCount - beforeCount;
    } catch (error) {
        console.error('Error refreshing video pool:', error);
        return 0;
    }
}

