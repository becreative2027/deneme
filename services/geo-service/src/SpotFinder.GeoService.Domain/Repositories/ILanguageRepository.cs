using SpotFinder.GeoService.Domain.Entities;

namespace SpotFinder.GeoService.Domain.Repositories;

public interface ILanguageRepository
{
    Task<Language?> GetByCodeAsync(string code, CancellationToken ct = default);
    Task<IReadOnlyList<Language>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Language language, CancellationToken ct = default);
}
