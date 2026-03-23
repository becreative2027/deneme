using Microsoft.EntityFrameworkCore;
using SpotFinder.IdentityService.Domain.Entities;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Infrastructure.Persistence;

namespace SpotFinder.IdentityService.Infrastructure.Repositories;

public sealed class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly IdentityDbContext _context;
    public RefreshTokenRepository(IdentityDbContext context) => _context = context;

    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken ct = default)
        => await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == token, ct);

    public async Task AddAsync(RefreshToken token, CancellationToken ct = default)
        => await _context.RefreshTokens.AddAsync(token, ct);

    public void Update(RefreshToken token)
        => _context.RefreshTokens.Update(token);
}
