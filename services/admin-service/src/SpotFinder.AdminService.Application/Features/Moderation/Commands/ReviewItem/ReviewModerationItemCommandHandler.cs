using SpotFinder.AdminService.Infrastructure.Services;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.Moderation.Commands.ReviewItem;

public sealed class ReviewModerationItemCommandHandler : ICommandHandler<ReviewModerationItemCommand>
{
    private readonly IModerationRepository    _moderationRepository;
    private readonly IAuditLogRepository      _auditLogRepository;
    private readonly IUnitOfWork              _unitOfWork;
    private readonly IContentDeletionService  _contentDeletion;

    public ReviewModerationItemCommandHandler(
        IModerationRepository moderationRepository,
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        IContentDeletionService contentDeletion)
    {
        _moderationRepository = moderationRepository;
        _auditLogRepository   = auditLogRepository;
        _unitOfWork           = unitOfWork;
        _contentDeletion      = contentDeletion;
    }

    public async Task Handle(ReviewModerationItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _moderationRepository.GetByIdAsync(request.ModerationItemId, cancellationToken)
            ?? throw new InvalidOperationException("Moderation item not found.");

        if (request.Approve)
        {
            item.Approve(request.AdminId, request.Note);

            // Approved = content is harmful → delete it
            if (item.TargetType is ModerationTargetType.Post or ModerationTargetType.Review)
                await _contentDeletion.DeleteAsync(item.TargetType, item.TargetId, cancellationToken);
        }
        else
        {
            item.Reject(request.AdminId, request.Note);
        }

        _moderationRepository.Update(item);

        var auditLog = AuditLog.Create(request.AdminId, request.Approve ? "Approve" : "Reject", "ModerationItem", item.Id, request.Note);
        await _auditLogRepository.AddAsync(auditLog, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
