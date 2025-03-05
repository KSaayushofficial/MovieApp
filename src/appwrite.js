import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, {
      queries: [Query.equal("searchTerm", normalizedSearchTerm)],
    });

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: (doc.count || 0) + 1,
      });
    } else {
      if (!movie || !movie.id || !movie.poster_path) return; // Ensure movie data exists
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: normalizedSearchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, {
      queries: [Query.orderDesc("count"), Query.limit(5)],
    });

    if (!result || !result.documents) return [];
    return result.documents;
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};
