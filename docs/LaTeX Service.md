# LaTeX Document Generation Service

## Overview

This document outlines the technical specification for implementing a LaTeX-based resume generation service within our Firebase-centric AI Resume Writer application. The service will enable dynamic, AI-powered resume generation with professional LaTeX formatting.

## Architecture: Firebase Cloud Functions + Containerized LaTeX Service

### System Components

1. **NextJS Frontend**: User interface for resume generation
2. **Firebase Cloud Functions**: API orchestration and business logic
3. **Vertex AI/Gemini**: AI content generation
4. **Cloud Run LaTeX Container**: Document compilation service
5. **Firebase Storage**: Template storage and PDF output
6. **Firestore**: Job data, user profiles, and generation metadata

### Data Flow

```
User Request → NextJS Frontend → Firebase Cloud Function → Vertex AI → LaTeX Container → PDF → Firebase Storage → User Download
```

## Technical Specifications

### 1. Firebase Cloud Function: `generateResume`

**Endpoint**: `POST /generateResume`

**Input Parameters**:
```typescript
interface GenerateResumeRequest {
  userId: string;
  jobId: string;
  templateId: string;
  customizations?: {
    colorScheme?: string;
    fontFamily?: string;
    sections?: string[];
  };
}
```

**Response**:
```typescript
interface GenerateResumeResponse {
  success: boolean;
  resumeId: string;
  downloadUrl: string;
  generatedAt: string;
  templateUsed: string;
}
```

**Function Responsibilities**:
- Validate user authentication and authorization
- Fetch user profile and job details from Firestore
- Generate tailored resume content using AI
- Call LaTeX container service for PDF generation
- Store generated PDF in Firebase Storage
- Return download URL and metadata

### 2. LaTeX Container Service (Cloud Run)

**Base Image**: `texlive/texlive:latest`

**Container Specifications**:
- **Memory**: 2GB (LaTeX compilation can be memory-intensive)
- **CPU**: 1 vCPU
- **Timeout**: 300 seconds
- **Concurrency**: 10 requests per instance

**API Endpoints**:

#### `POST /compile`
**Input**:
```json
{
  "templateId": "ats-friendly-single-column",
  "content": {
    "personalInfo": {...},
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": [...],
    "certifications": [...]
  },
  "customizations": {
    "colorScheme": "blue",
    "fontFamily": "Arial"
  }
}
```

**Output**:
```json
{
  "success": true,
  "pdfBase64": "JVBERi0xLjQKJe...",
  "metadata": {
    "pages": 2,
    "compilationTime": "1.2s",
    "templateVersion": "1.0"
  }
}
```

#### `GET /templates`
Returns list of available templates with metadata

#### `GET /health`
Health check endpoint for Cloud Run

### 3. Template Structure

**Storage Location**: `gs://[bucket]/latex-templates/`

**Template Directory Structure**:
```
latex-templates/
├── ats-friendly-single-column/
│   ├── template.tex           # Main LaTeX template
│   ├── metadata.json          # Template configuration
│   ├── preview.png           # Template preview image
│   └── styles/
│       ├── colors.tex        # Color definitions
│       ├── fonts.tex         # Font configurations
│       └── spacing.tex       # Layout spacing
└── modern-professional/
    └── ...
```

**Template Variables**:
Templates use placeholder syntax: `{{VARIABLE_NAME}}`

Standard variables:
- `{{PERSONAL_INFO}}` - Name, contact information
- `{{SUMMARY}}` - Professional summary/objective
- `{{EXPERIENCE_SECTION}}` - Work history with bullet points
- `{{EDUCATION_SECTION}}` - Educational background
- `{{SKILLS_SECTION}}` - Technical and soft skills
- `{{CERTIFICATIONS_SECTION}}` - Professional certifications

### 4. AI Content Generation

**Vertex AI Integration**:
- Use existing Gemini integration from current functions
- Create specialized prompts for resume content generation
- Optimize content for ATS compatibility
- Generate LaTeX-compatible formatting

**Content Generation Strategy**:
1. **Job Analysis**: Extract key requirements and keywords from job posting
2. **Profile Matching**: Identify relevant experience and skills from user profile
3. **Content Tailoring**: Generate job-specific bullet points and summaries
4. **ATS Optimization**: Ensure keyword density and formatting compatibility

## Step-by-Step Work Breakdown

### Phase 1: Foundation Setup

#### 1.1 LaTeX Container Development
- [ ] Create Dockerfile with TeXLive base image
- [ ] Implement REST API endpoints (`/compile`, `/templates`, `/health`)
- [ ] Add template loading and variable substitution logic
- [ ] Implement PDF generation and base64 encoding
- [ ] Create error handling and logging

#### 1.2 Template Creation
- [ ] Design ATS-friendly single-column template
- [ ] Create template.tex with placeholder variables
- [ ] Define metadata.json structure
- [ ] Generate template preview image
- [ ] Test template compilation with sample data

#### 1.3 Container Deployment
- [ ] Build and test Docker image locally
- [ ] Deploy to Google Cloud Run
- [ ] Configure environment variables and secrets
- [ ] Set up monitoring and logging
- [ ] Test container endpoints

### Phase 2: Firebase Integration

#### 2.1 Cloud Function Development
- [ ] Create `generateResume` Cloud Function
- [ ] Implement authentication and authorization
- [ ] Add Firestore data fetching (user profile, job details)
- [ ] Integrate with existing Vertex AI service
- [ ] Implement container service calls

#### 2.2 Content Generation Logic
- [ ] Create resume-specific AI prompts
- [ ] Implement job-to-profile matching algorithm
- [ ] Add LaTeX formatting for AI-generated content
- [ ] Create content validation and sanitization
- [ ] Test AI content generation pipeline

#### 2.3 Storage Integration
- [ ] Set up Firebase Storage bucket for templates and PDFs
- [ ] Implement PDF upload and URL generation
- [ ] Add metadata storage in Firestore
- [ ] Create cleanup job for old generated files
- [ ] Test end-to-end storage flow

### Phase 3: Frontend Integration

#### 3.1 UI Components
- [ ] Create resume generation interface
- [ ] Add template selection component
- [ ] Implement job selection dropdown
- [ ] Add customization options (colors, fonts)
- [ ] Create progress indicators and loading states

#### 3.2 API Integration
- [ ] Implement frontend API calls to Cloud Function
- [ ] Add error handling and user feedback
- [ ] Create PDF download functionality
- [ ] Add resume generation history
- [ ] Test user experience flow

#### 3.3 Testing and Refinement
- [ ] End-to-end testing with real user data
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] UI/UX refinements based on testing
- [ ] Documentation updates

### Phase 4: Production Readiness (Week 4)

#### 4.1 Monitoring and Logging
- [ ] Set up Cloud Monitoring for container service
- [ ] Add detailed logging to Cloud Functions
- [ ] Create alerting for service failures
- [ ] Implement usage analytics
- [ ] Add performance metrics tracking

#### 4.2 Security and Validation
- [ ] Input validation for all endpoints
- [ ] Rate limiting implementation
- [ ] Security scanning of container
- [ ] CORS configuration
- [ ] Authentication token validation

#### 4.3 Deployment and Launch
- [ ] Production deployment of all components
- [ ] Load testing and performance validation
- [ ] User acceptance testing
- [ ] Documentation completion
- [ ] Launch preparation

## Evolution to Optimized Service

### Phase 5: Performance Optimization (Future Enhancement)

#### 5.1 Caching Layer Implementation
**Objective**: Reduce compilation time and improve user experience

**Components to Add**:
- **Template Metadata Cache**: Store compiled template information in Firestore
  ```typescript
  interface TemplateCache {
    templateId: string;
    compiledBase: string; // Base64 of pre-compiled template
    lastUpdated: Date;
    variables: string[];
    compilationTime: number;
  }
  ```

- **Content Fragment Cache**: Cache frequently used resume sections
  ```typescript
  interface ContentCache {
    userId: string;
    sectionType: 'experience' | 'skills' | 'education';
    content: string;
    lastUsed: Date;
    useCount: number;
  }
  ```

#### 5.2 Enhanced LaTeX Container
**Upgrades**:
- **Template Pre-processing**: Pre-compile template bases without content
- **Incremental Compilation**: Only recompile changed sections
- **Font Caching**: Pre-load and cache font definitions
- **Parallel Processing**: Handle multiple sections concurrently

**New Container Endpoints**:
- `POST /precompile` - Pre-compile template base
- `POST /incremental` - Incremental compilation with cached base
- `GET /cache/status` - Cache utilization metrics

#### 5.3 Intelligent Template Management
**Features**:
- **Template Inheritance**: Base templates with customizable overlays
- **Component System**: Reusable template components
- **Version Control**: Track template changes and compatibility
- **A/B Testing**: Multiple template variants for performance testing

**Template Structure Evolution**:
```
latex-templates/
├── base/
│   ├── common-styles.tex
│   ├── base-layout.tex
│   └── variables.tex
├── components/
│   ├── headers/
│   ├── sections/
│   └── footers/
└── templates/
    ├── ats-friendly/
    │   ├── template.tex (inherits from base)
    │   └── overrides.tex
    └── modern/
        └── ...
```

#### 5.4 Performance Monitoring and Analytics
**Metrics to Track**:
- Template compilation times
- Cache hit/miss ratios
- User template preferences
- Generation success rates
- PDF quality metrics

**Optimization Triggers**:
- Auto-scaling based on compilation queue length
- Template pre-warming for popular combinations
- Intelligent cache eviction policies
- Performance-based template recommendations

### Migration Path from Option 1 to Option 3

1. **Phase 1**: Implement basic caching layer without changing core architecture
2. **Phase 2**: Enhance LaTeX container with pre-compilation features
3. **Phase 3**: Add intelligent template management system
4. **Phase 4**: Implement advanced caching and performance optimization
5. **Phase 5**: Add analytics and automated optimization features

**Benefits of Evolution**:
- **Performance**: 60-80% reduction in generation time
- **Scalability**: Handle 10x more concurrent requests
- **User Experience**: Near-instant resume updates and previews
- **Cost Optimization**: Reduced compute usage through caching
- **Intelligence**: Data-driven template and content recommendations

This evolution can be implemented incrementally without breaking existing functionality, allowing for continuous improvement of the service while maintaining backward compatibility.
