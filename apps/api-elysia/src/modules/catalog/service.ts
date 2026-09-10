import { generateSlug } from "@/common/utils/slugify";
import { catalogRepository } from "./repository";

export const catalogService = {
  async fetchPublicCatalog(query: {
    page?: string;
    limit?: string;
    type?: "BOOK" | "ESSAY";
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const { items, total } = await catalogRepository.getPublicCatalog({
      type: query.type,
      limit,
      offset,
    });
    return {
      success: true,
      data: items,
      count: items.length,
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async fetchCatalogDetail(slug: string) {
    const item = await catalogRepository.getCatalogBySlug(slug);

    if (!item) {
      throw new Error("Catalog item not found or not published");
    }

    return {
      success: true,
      data: item,
    };
  },

  async createCatalogEntryFromSubmission(submissionId: string, userId: string) {
    const sub = await catalogRepository.findSubmissionTitle(submissionId);

    if (!sub) {
      throw new Error("Submission not found");
    }

    let baseSlug = generateSlug(sub.title);
    let finalSlug = baseSlug;

    // Cek duplikasi slug di database
    const existing = await catalogRepository.findCatalogBySlug(finalSlug);
    if (existing) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    const newCatalog = await catalogRepository.insertCatalogEntry({
      submissionId,
      slug: finalSlug,
      publishedById: userId,
    });

    return {
      success: true,
      data: newCatalog,
    };
  },
};
