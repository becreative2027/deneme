using Microsoft.EntityFrameworkCore;
using SpotFinder.GeoService.Domain.Entities;
using SpotFinder.GeoService.Domain.Repositories;
using SpotFinder.GeoService.Infrastructure.Persistence;

namespace SpotFinder.GeoService.Infrastructure.Repositories;

public sealed class LanguageRepository : ILanguageRepository
{
    private readonly GeoDbContext _context;
    public LanguageRepository(GeoDbContext context) => _context = context;

    public async Task<Language?> GetByCodeAsync(string code, CancellationToken ct = default)
        => await _context.Languages.FirstOrDefaultAsync(l => l.Code == code.ToLowerInvariant(), ct);

    public async Task<IReadOnlyList<Language>> GetAllAsync(CancellationToken ct = default)
        => await _context.Languages.ToListAsync(ct);

    public async Task AddAsync(Language language, CancellationToken ct = default)
        => await _context.Languages.AddAsync(language, ct);
}
