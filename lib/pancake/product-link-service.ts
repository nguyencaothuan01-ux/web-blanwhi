import { buildProductInventory } from "@/lib/product-inventory";
import { PancakeIntegrationError } from "@/lib/pancake/exception-handler";
import { PancakeService } from "@/lib/pancake/pancake-service";
import { Validator } from "@/lib/pancake/validator";
import { readSiteContent, writeSiteContent } from "@/lib/site-content";

export type ProductLinkInput = {
  productId?: string;
  rowKey?: string;
  variationId?: string;
  variation?: {
    id?: string;
    productId?: string;
    sku?: string;
    quantity?: number;
  };
};

export class ProductLinkService {
  constructor(private readonly pancake = new PancakeService()) {}

  async variations() {
    return this.pancake.variations();
  }

  async update(input: ProductLinkInput) {
    const productId = Validator.required(input.productId, "mã sản phẩm website");
    const rowKey = Validator.required(input.rowKey, "dòng phân loại/màu/size");
    const variationId = String(input.variationId || "").trim();
    const content = await readSiteContent();
    const product = content.products.find((item) => item.id === productId);

    if (!product) {
      throw new PancakeIntegrationError("Không tìm thấy sản phẩm website.", "PRODUCT_NOT_FOUND", 404);
    }

    const inventory = buildProductInventory(product);
    const target = inventory.find((item) => item.key === rowKey);
    if (!target) {
      throw new PancakeIntegrationError("Không tìm thấy phân loại, màu hoặc size cần liên kết.", "INVENTORY_ROW_NOT_FOUND", 404);
    }

    let link = {
      pancakeProductId: "",
      pancakeVariationId: "",
      pancakeSku: "",
      pancakeQuantity: 0,
      lastSyncedAt: undefined as string | undefined
    };

    if (variationId) {
      const suppliedVariation = input.variation?.id === variationId
        ? {
            id: variationId,
            productId: String(input.variation.productId || ""),
            sku: String(input.variation.sku || "").toUpperCase(),
            quantity: Validator.quantity(input.variation.quantity)
          }
        : null;
      const variation = suppliedVariation || (await this.pancake.variations()).find((item) => item.id === variationId);
      if (!variation) {
        throw new PancakeIntegrationError("Biến thể Pancake đã chọn không còn tồn tại.", "PANCAKE_VARIATION_NOT_FOUND", 404);
      }
      link = {
        pancakeProductId: variation.productId,
        pancakeVariationId: variation.id,
        pancakeSku: variation.sku,
        pancakeQuantity: variation.quantity,
        lastSyncedAt: new Date().toISOString()
      };
    }

    const products = content.products.map((item) => item.id === productId
      ? {
          ...item,
          inventory: inventory.map((inventoryItem) => inventoryItem.key === rowKey
            ? { ...inventoryItem, ...link }
            : inventoryItem)
        }
      : item);

    await writeSiteContent({ ...content, products });

    return {
      productId,
      rowKey,
      linked: Boolean(variationId),
      pancakeProductId: link.pancakeProductId,
      pancakeVariationId: link.pancakeVariationId,
      pancakeSku: link.pancakeSku,
      pancakeQuantity: link.pancakeQuantity,
      lastSyncedAt: link.lastSyncedAt
    };
  }
}
