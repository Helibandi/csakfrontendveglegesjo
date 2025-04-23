using PizzaBackend.DTOs.Product;
using PizzaBackend.Models;
using System;

namespace PizzaBackend.Mappings
{
    public static class ProductMappers
    {
        public static ProductDTO ToProductDTO(this Product product)
        {
            return product == null ? null : new ProductDTO
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Price = product.Price,
                Category = product.Category.ToString(),
                IsAvailable = product.IsAvailable
            };
        }

        public static Product ToProduct(this CreateProductDTO dto)
        {
            if (dto == null) return null;

            return new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                ImageUrl = dto.ImageUrl,
                Price = dto.Price,
                Category = ParseCategory(dto.Category),
                IsAvailable = dto.IsAvailable
            };
        }

        public static Product ToProduct(this UpdateProductDTO dto, Product product)
        {
            if (dto == null || product == null) return product;

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.ImageUrl = dto.ImageUrl;
            product.Price = dto.Price;
            product.Category = ParseCategory(dto.Category);
            

            return product;
        }

        public static Product UpdateAvailability(this Product product, ToggleAvailabilityDTO dto)
        {
            if (product == null || dto == null) return product;

            product.IsAvailable = dto.IsAvailable;
            return product;
        }

        public static ProductDetailsDTO ToProductDetailsDTO(this Product product)
        {
            return product == null ? null : new ProductDetailsDTO
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Price = product.Price,
                Category = product.Category.ToString(),
                IsAvailable = product.IsAvailable,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt
            };
        }

        private static ProductCategory ParseCategory(string category)
        {
            return Enum.TryParse<ProductCategory>(category, true, out var result)
                ? result
                : throw new ArgumentException($"Invalid category: {category}");
        }
    }
}