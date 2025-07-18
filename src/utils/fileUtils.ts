import { getStorage, ref, getMetadata, listAll, deleteObject, getDownloadURL } from "firebase/storage";

export interface FileData {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    size: string;
    url: string;
}

/**
 * Utility function to get file type from filename
 */
const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'PDF';
        case 'docx':
        case 'doc':
            return 'DOCX';
        case 'txt':
            return 'TXT';
        case 'md':
            return 'MD';
        default:
            return 'UNKNOWN';
    }
};

/**
 * Utility function to format file size
 */
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Retrieves all uploaded files for a user directly from Firebase Storage
 * @param userId - The user's UID
 * @returns Promise<FileData[]> - Array of file data objects
 */
export const getUserFiles = async (userId: string): Promise<FileData[]> => {
    try {
        const storage = getStorage();
        const listRef = ref(storage, `uploads/${userId}`);

        console.log(`Loading files from Storage for user: ${userId}`);

        const result = await listAll(listRef);

        if (result.items.length === 0) {
            console.log("No files found in Storage for user");
            return [];
        }

        console.log(`Found ${result.items.length} files in Storage`);

        // Get metadata and download URL for each file
        const filePromises = result.items.map(async (itemRef) => {
            try {
                const [metadata, downloadURL] = await Promise.all([
                    getMetadata(itemRef),
                    getDownloadURL(itemRef)
                ]);

                return {
                    id: itemRef.name, // Use filename as ID
                    name: itemRef.name,
                    type: getFileTypeFromName(itemRef.name),
                    uploadDate: metadata.timeCreated || new Date().toISOString(),
                    size: formatFileSize(metadata.size || 0),
                    url: downloadURL
                };
            } catch (error) {
                console.error(`Error processing file ${itemRef.name}:`, error);
                return null; // Filter out files we can't process
            }
        });

        const fileDataArray = await Promise.all(filePromises);

        // Filter out null entries and sort by upload date (newest first)
        const validFiles = fileDataArray
            .filter((file): file is FileData => file !== null)
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

        console.log(`Returning ${validFiles.length} valid files`);
        return validFiles;

    } catch (error) {
        console.error("Error retrieving user files from Storage:", error);
        // Return empty array instead of throwing - let the app continue to work
        return [];
    }
};

/**
 * Deletes a file from Firebase Storage
 * @param userId - The user's UID
 * @param fileName - The name of the file to delete
 * @returns Promise<void>
 */
export const deleteUserFile = async (userId: string, fileName: string): Promise<void> => {
    try {
        const storage = getStorage();
        const fileRef = ref(storage, `uploads/${userId}/${fileName}`);

        await deleteObject(fileRef);
        console.log(`Successfully deleted file: ${fileName}`);
    } catch (error) {
        console.error(`Error deleting file ${fileName}:`, error);
        throw new Error(`Failed to delete file: ${fileName}`);
    }
};
