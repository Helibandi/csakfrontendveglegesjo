using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzaBackend.DTOs.Product;
using PizzaBackend.Services;

[Route("api/[controller]")]
[ApiController]

public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    [AllowAnonymous]
   
    public async Task<ActionResult<IEnumerable<ProductDTO>>> GetProducts()
    {
        var products = await _productService.GetAllProductsAsync();
        return Ok(products);
    }

    

    [HttpGet("{id}")]
    [AllowAnonymous]

    public async Task<ActionResult<ProductDTO>> GetProduct(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        return product == null ? NotFound() : Ok(product);
    }

    [HttpPost]

    public async Task<ActionResult<ProductDTO>> CreateProduct([FromBody] CreateProductDTO createProductDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var createdProduct = await _productService.CreateProductAsync(createProductDto);
        return CreatedAtAction(nameof(GetProduct), new { id = createdProduct.Id }, createdProduct);
    }

    [HttpPut("{id}")]

    public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductDTO updateProductDto)
    {
        if (id != updateProductDto.Id || !ModelState.IsValid)
        {
            return BadRequest();
        }

        var updatedProduct = await _productService.UpdateProductAsync(updateProductDto);
        return updatedProduct == null ? NotFound() : NoContent();
    }

    [HttpPut("{id}/availability")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateProductAvailability(int id, [FromBody] ToggleAvailabilityDTO toggleDto)
    {
        if (!ModelState.IsValid)  // <-- Ellenőrizzük a modell érvényességét
        {
            return BadRequest(ModelState);
        }

        var updatedProduct = await _productService.UpdateProductAvailabilityAsync(id, toggleDto.IsAvailable);

        if (updatedProduct == null)
        {
            return NotFound($"Product with ID {id} not found."); 
        }

        return Ok(updatedProduct);
    }

    [HttpDelete("{id}")]

    public async Task<IActionResult> DeleteProduct(int id)
    {
        await _productService.DeleteProductAsync(id);
        return NoContent();
    }
}