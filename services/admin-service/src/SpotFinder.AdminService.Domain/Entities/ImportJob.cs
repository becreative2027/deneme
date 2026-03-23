using SpotFinder.BuildingBlocks.Domain;
using SpotFinder.AdminService.Domain.Enums;

namespace SpotFinder.AdminService.Domain.Entities;

public sealed class ImportJob : AggregateRoot<Guid>
{
    public string SourceName { get; private set; } = string.Empty;
    public ImportJobStatus Status { get; private set; } = ImportJobStatus.Pending;
    public int TotalRecords { get; private set; }
    public int ProcessedRecords { get; private set; }
    public int FailedRecords { get; private set; }
    public string? ErrorMessage { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    private ImportJob() { }

    public static ImportJob Create(Guid id, string sourceName)
        => new() { Id = id, SourceName = sourceName, CreatedAt = DateTime.UtcNow };

    public void Start(int totalRecords) { Status = ImportJobStatus.Running; TotalRecords = totalRecords; }
    public void IncrementProcessed() => ProcessedRecords++;
    public void IncrementFailed() => FailedRecords++;
    public void Complete() { Status = ImportJobStatus.Completed; CompletedAt = DateTime.UtcNow; }
    public void Fail(string error) { Status = ImportJobStatus.Failed; ErrorMessage = error; CompletedAt = DateTime.UtcNow; }
}
