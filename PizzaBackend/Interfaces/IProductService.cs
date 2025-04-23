using PizzaBackend.DTOs.Product;
using PizzaBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PizzaBackend.Services
{
    public interface IProductService
    {
        Task<ProductDTO> GetProductByIdAsync(int productId);
        Task<IEnumerable<ProductDTO>> GetAllProductsAsync(bool onlyAvailable = false);
        Task<ProductDTO> CreateProductAsync(CreateProductDTO createProductDto);
        Task<ProductDTO> UpdateProductAsync(UpdateProductDTO updateProductDto);
        Task<ProductDTO> UpdateProductAvailabilityAsync(int productId, bool isAvailable);
        Task DeleteProductAsync(int productId);
        Task<bool> IsProductAvailableAsync(int productId);
        Task<decimal> GetProductPriceAsync(int productId);
        Task<IEnumerable<ProductDTO>> GetProductsByCategoryAsync(ProductCategory category);
    }
}