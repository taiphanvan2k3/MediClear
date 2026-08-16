/**
 * Dịch vụ tìm kiếm Web Y tế (Medical Web Grounding Engine)
 * Tích hợp hệ thống Domain Y tế Tuyến Trung Ương & Quốc Tế Uy Tín Hàng Đầu Việt Nam
 */

import { config } from "../config/env";
import { TRUSTED_MEDICAL_DOMAINS, getMedicalDomainLabel } from "../constants/medicalDomains.constant";

export interface WebSearchResult {
  title: string;
  uri: string;
  snippet: string;
}

export class WebSearchService {
  /**
   * Tìm kiếm thông tin thuốc từ các nguồn y tế hàng đầu Việt Nam
   * @param drugName Tên thuốc hoặc hoạt chất y tế (ví dụ: "tretinoin 0.05", "Atenolol 50mg")
   */
  async searchMedicine(drugName: string): Promise<WebSearchResult[]> {
    const cleanTarget = drugName.trim();
    if (!cleanTarget) return [];

    try {
      // 1. Ưu tiên Tavily Search API
      const tavilyApiKey = config.tavily.apiKey || process.env.TAVILY_API_KEY;
      if (tavilyApiKey) {
        const tavilyResults = await this._searchTavily(cleanTarget, tavilyApiKey);
        if (tavilyResults.length > 0) return tavilyResults;
      }

      // 2. Dự phòng qua Public Medical Web Engine
      return await this._searchPublicMedicalWeb(cleanTarget);
    } catch (error) {
      console.warn("[WebSearchService] Lỗi khi tìm kiếm web:", error);
      return [];
    }
  }

  /**
   * Tìm kiếm qua Tavily Search API với danh mục domain y tế chọn lọc
   */
  private async _searchTavily(drugName: string, apiKey: string): Promise<WebSearchResult[]> {
    try {
      // Tìm kiếm trực tiếp với tên thuốc để tối ưu điểm relevance
      const searchQuery = drugName.toLowerCase().startsWith("thuốc") ? drugName : `Thuốc ${drugName}`;

      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: searchQuery,
          search_depth: "basic",
          max_results: 6,
          include_images: true,
          include_domains: [...TRUSTED_MEDICAL_DOMAINS],
        }),
      });

      if (!response.ok) return [];
      const data = await response.json();
      const rawResults = data.results || [];

      // Trích xuất từ khóa chính của thuốc (bỏ từ "thuốc", "viên", "bôi")
      const keywords = drugName
        .toLowerCase()
        .split(/[\s,./+-_%0-9]+/)
        .filter((w) => w.length >= 3 && !["thuốc", "viên", "bôi", "ngoài", "uống", "chai", "lọ"].includes(w));

      // Lọc các bài viết thật sự liên quan và có độ tin cậy cao
      const verifiedResults: WebSearchResult[] = [];
      for (const r of rawResults) {
        const titleLower = (r.title || "").toLowerCase();
        const contentLower = (r.content || "").toLowerCase();
        const score = typeof r.score === "number" ? r.score : 0.5;

        // Chỉ lấy nếu điểm score > 0.3 hoặc bài viết chứa từ khóa hoạt chất cốt lõi
        const isKeywordMatch =
          keywords.length === 0 || keywords.some((kw) => titleLower.includes(kw) || contentLower.includes(kw));

        if ((score >= 0.4 || isKeywordMatch) && r.url) {
          const domainLabel = getMedicalDomainLabel(r.url);
          const cleanTitle = r.title
            ? r.title.replace(/\s*[-|–]\s*(Vinmec|Long Châu|Tâm Anh|YouMed|Medlatec|Trung Tâm Thuốc|HelloBacsi).*/gi, "").trim()
            : "Tài liệu Y tế";

          verifiedResults.push({
            title: `[${domainLabel}] ${cleanTitle}`,
            uri: r.url,
            snippet: r.content || "",
          });
        }
      }

      if (verifiedResults.length > 0) {
        return verifiedResults.slice(0, 4);
      }

      return [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Tìm kiếm qua Public Medical Web Endpoint (Dự phòng)
   */
  private async _searchPublicMedicalWeb(drugName: string): Promise<WebSearchResult[]> {
    try {
      const targetSites = TRUSTED_MEDICAL_DOMAINS.slice(0, 5).map((d) => `site:${d}`).join(" OR ");
      const searchTarget = `Thuốc ${drugName} ${targetSites}`;
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchTarget)}`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) return [];
      const html = await response.text();

      const results: WebSearchResult[] = [];
      const linkMatches = [...html.matchAll(/<a class="result__url" href="([^"]+)">([\s\S]*?)<\/a>/g)];
      const titleMatches = [...html.matchAll(/<a class="result__snippet[^>]*>([\s\S]*?)<\/a>/g)];

      for (let i = 0; i < Math.min(linkMatches.length, 4); i++) {
        const rawUrl = linkMatches[i][1];
        const urlMatch = rawUrl.match(/uddg=([^&]+)/);
        const cleanUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : rawUrl;
        const snippet = titleMatches[i] ? titleMatches[i][1].replace(/<[^>]+>/g, "").trim() : "";
        const domainLabel = getMedicalDomainLabel(cleanUrl);

        if (cleanUrl.startsWith("http")) {
          results.push({
            title: domainLabel,
            uri: cleanUrl,
            snippet,
          });
        }
      }

      return results;
    } catch (e) {
      console.warn("[WebSearchService] Không thể cào dữ liệu tìm kiếm:", e);
      return [];
    }
  }
}

export const webSearchService = new WebSearchService();
