# Changelog

All notable changes to Story Machine will be documented in this file.

## [3.0.0] - 2025-10-23

### 🎉 Major Release - Production Ready

#### Added
- **Complete rebranding** to "Story Machine" for better user experience
- **Comprehensive test suite** with 28 tests covering core functionality
- **Modular Worker architecture** with separated concerns
- **Centralized configuration** management system
- **Enhanced security** with CORS restrictions and file size limits
- **Production deployment** with Wrangler Pages integration
- **Error message unification** in English for consistency
- **Constants management** to eliminate magic numbers
- **Production test report** with detailed metrics

#### Changed
- **Application title** from "Object Recognition Story Machine" to "Story Machine"
- **Package name** from "object-recognition-story-machine" to "story-machine"
- **Deployment process** to use Wrangler for both frontend and backend
- **CORS configuration** to support specific domains and wildcards
- **Image processing logic** unified and optimized
- **Error handling** standardized across all components
- **UI text** converted to English for international consistency

#### Removed
- **Duplicate configuration** files (`api.develop.ts`)
- **Commented code** and unused imports
- **Hardcoded values** replaced with constants
- **Redundant image processing** logic
- **Unused test images** and temporary files

#### Fixed
- **CORS security** vulnerabilities with proper domain restrictions
- **File size validation** with 10MB maximum limit
- **Error message consistency** across frontend and backend
- **Code duplication** in image processing
- **Configuration management** issues
- **Deployment automation** with proper error handling

#### Security
- **CORS restrictions** to specific allowed domains
- **File size limits** to prevent abuse (10MB max)
- **Input validation** for all user inputs
- **Error message sanitization** to prevent information leakage
- **Secure deployment** with proper environment configuration

#### Performance
- **Optimized build size** (109kB total)
- **Faster deployment** with Wrangler integration
- **Improved error handling** with better user feedback
- **Modular architecture** for better maintainability
- **Test coverage** for reliable deployments

#### Technical Details
- **Frontend**: Next.js 15.5.6 with React 19.1.0
- **Backend**: Cloudflare Workers with AI bindings
- **Deployment**: Cloudflare Pages + Workers
- **Testing**: Jest with 28 comprehensive tests
- **Build**: Optimized static export with 5 pages
- **Security**: CORS, file limits, input validation

#### Production URLs
- **Frontend**: https://22833b3c.orsm.pages.dev
- **API**: https://orsm-ai.xushibo.cn
- **Custom Domain**: https://orsm.xushibo.cn (DNS pending)

#### Quality Metrics
- ✅ **Test Coverage**: 28/28 tests passing
- ✅ **Linting**: Zero errors
- ✅ **Build Size**: 109kB (optimized)
- ✅ **Performance**: <3s API response
- ✅ **Security**: CORS + file limits
- ✅ **Deployment**: Production ready

---

## [2.x.x] - Previous Versions

### Legacy Features
- Object Recognition Story Machine branding
- Basic AI integration
- Mobile camera functionality
- Story generation capabilities
- Cloudflare deployment

---

## Release Notes

### v3.0.0 Highlights
This major release represents a complete transformation of the application:

1. **Rebranding**: Simplified name to "Story Machine" for better user experience
2. **Architecture**: Modular, maintainable code structure
3. **Security**: Production-ready security measures
4. **Testing**: Comprehensive test coverage
5. **Deployment**: Automated, reliable deployment process
6. **Performance**: Optimized for production use

### Migration Guide
- No breaking changes for end users
- All existing functionality preserved
- Enhanced security and performance
- Improved error handling and user feedback

### Support
- Production deployment verified
- Comprehensive documentation
- Test coverage ensures reliability
- Automated deployment process

---

*For technical support or questions, please refer to the README.md or create an issue in the repository.*
