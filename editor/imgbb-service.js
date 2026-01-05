// Visual Email Editor - ImgBB Image Hosting Service

const IMGBB_SERVICE = {
    API_URL: 'https://api.imgbb.com/1/upload',
    apiKey: null,

    /**
     * Initialize the service, loading API key from storage
     */
    async init() {
        try {
            const storage = await browser.storage.local.get('imgbbApiKey');
            this.apiKey = storage.imgbbApiKey || null;
            console.log('ImgBB Service initialized, API key:', this.apiKey ? 'configured' : 'not set');
        } catch (e) {
            console.error('Error initializing ImgBB service:', e);
        }
    },

    /**
     * Check if the service is configured
     */
    isConfigured() {
        return !!this.apiKey;
    },

    /**
     * Set the API key
     */
    async setApiKey(key) {
        this.apiKey = key;
        await browser.storage.local.set({ imgbbApiKey: key });
        console.log('ImgBB API key saved');
    },

    /**
     * Get the current API key
     */
    getApiKey() {
        return this.apiKey || '';
    },

    /**
     * Upload a base64 image to ImgBB
     * @param {string} base64Data - The base64 encoded image (with or without data URI prefix)
     * @param {string} name - Optional name for the image
     * @returns {Promise<{url: string, deleteUrl: string, size: number}>}
     */
    async uploadImage(base64Data, name = 'image') {
        if (!this.isConfigured()) {
            throw new Error('ImgBB API key not configured');
        }

        // Remove data URI prefix if present
        let cleanBase64 = base64Data;
        if (base64Data.includes('base64,')) {
            cleanBase64 = base64Data.split('base64,')[1];
        }

        // Create form data
        const formData = new FormData();
        formData.append('key', this.apiKey);
        formData.append('image', cleanBase64);
        formData.append('name', name);

        try {
            console.log('Uploading image to ImgBB...');
            const response = await fetch(this.API_URL, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || 'Upload failed');
            }

            console.log('Image uploaded successfully:', result.data.url);

            return {
                url: result.data.url,
                displayUrl: result.data.display_url,
                deleteUrl: result.data.delete_url,
                size: result.data.size,
                width: result.data.width,
                height: result.data.height
            };
        } catch (error) {
            console.error('ImgBB upload error:', error);
            throw error;
        }
    },

    /**
     * Process HTML and upload all base64 images to ImgBB
     * @param {string} html - HTML content with base64 images
     * @returns {Promise<{html: string, uploadedCount: number, savedBytes: number}>}
     */
    async processHtmlImages(html) {
        if (!this.isConfigured()) {
            console.log('ImgBB not configured, skipping image upload');
            return { html, uploadedCount: 0, savedBytes: 0 };
        }

        const imgRegex = /<img([^>]*)src="(data:image\/([^;]+);base64,([^"]+))"([^>]*)>/gi;
        let processedHtml = html;
        let uploadedCount = 0;
        let savedBytes = 0;
        const images = [];

        // Find all base64 images
        let match;
        while ((match = imgRegex.exec(html)) !== null) {
            images.push({
                fullMatch: match[0],
                dataUri: match[2],
                base64: match[4]
            });
        }

        console.log(`Found ${images.length} base64 images to upload`);

        // Upload each image
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            try {
                const originalSize = img.base64.length * 0.75; // Approximate original bytes
                const result = await this.uploadImage(img.dataUri, `email_image_${i}`);

                // Replace base64 with URL
                processedHtml = processedHtml.replace(img.dataUri, result.displayUrl);

                uploadedCount++;
                savedBytes += originalSize;

                console.log(`Image ${i + 1}/${images.length} uploaded: ${result.displayUrl}`);
            } catch (error) {
                console.error(`Failed to upload image ${i + 1}:`, error);
                // Keep original base64 if upload fails
            }
        }

        return {
            html: processedHtml,
            uploadedCount,
            savedBytes
        };
    }
};

// Initialize on load
IMGBB_SERVICE.init();
