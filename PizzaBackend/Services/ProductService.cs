using Microsoft.EntityFrameworkCore;
using PizzaBackend.Data;
using PizzaBackend.DTOs.Product;
using PizzaBackend.Mappings;
using PizzaBackend.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PizzaBackend.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ProductDTO> GetProductByIdAsync(int productId)
        {
            var product = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == productId);

            return product?.ToProductDTO();
        }

        public async Task<IEnumerable<ProductDTO>> GetAllProductsAsync(bool onlyAvailable = false)
        {
            var query = _context.Products.AsNoTracking();

            if (onlyAvailable)
                query = query.Where(p => p.IsAvailable);

            return await query
                .Select(p => p.ToProductDTO())
                .ToListAsync();
        }

        public async Task<ProductDTO> CreateProductAsync(CreateProductDTO createProductDto)
        {
            var product = createProductDto.ToProduct();

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return product.ToProductDTO();
        }

        public async Task<ProductDTO> UpdateProductAsync(UpdateProductDTO updateProductDto)
        {
            var product = await _context.Products.FindAsync(updateProductDto.Id);
            if (product == null) return null;

            product = updateProductDto.ToProduct(product);
            await _context.SaveChangesAsync();

            return product.ToProductDTO();
        }

        public async Task<ProductDTO> UpdateProductAvailabilityAsync(int productId, bool isAvailable)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return null;

            product.IsAvailable = isAvailable;
            await _context.SaveChangesAsync();

            return product.ToProductDTO();
        }

        public async Task DeleteProductAsync(int productId)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null) return;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> IsProductAvailableAsync(int productId)
        {
            return await _context.Products
                .AsNoTracking()
                .AnyAsync(p => p.Id == productId && p.IsAvailable);
        }

        public async Task<decimal> GetProductPriceAsync(int productId)
        {
            return await _context.Products
                .Where(p => p.Id == productId)
                .Select(p => p.Price)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<ProductDTO>> GetProductsByCategoryAsync(ProductCategory category)
        {
            return await _context.Products
                .AsNoTracking()
                .Where(p => p.Category == category && p.IsAvailable)
                .Select(p => p.ToProductDTO())
                .ToListAsync();
        }
    }
}