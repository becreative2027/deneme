using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Create;

public sealed record AdminCreateLabelCommand(
    int                          CategoryId,
    string                       Key,
    List<LabelTranslationInput>? Translations = null,
    string?                      CreatedBy    = null)
    : IRequest<ApiResult<int>>;

public sealed record LabelTranslationInput(int LanguageId, string DisplayName);
