// Phase 7.2: IUserEventService moved to Infrastructure.Abstractions
// to avoid a circular project reference (Application → Infrastructure is the
// correct dependency direction; Infrastructure must NOT reference Application).
// See: SpotFinder.ContentService.Infrastructure.Abstractions.IUserEventService
