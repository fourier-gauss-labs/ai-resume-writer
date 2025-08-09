"""
Input validation utilities for LaTeX service.
"""

from typing import Dict, List, Any, Optional


def validate_compile_request(data: Dict[str, Any]) -> List[str]:
    """
    Validate compile request data.

    Args:
        data: Request data dictionary

    Returns:
        List of validation error messages (empty if valid)
    """
    errors = []

    # Check required fields
    required_fields = ['templateId', 'content']
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")

    if 'templateId' in data:
        if not isinstance(data['templateId'], str) or not data['templateId'].strip():
            errors.append("templateId must be a non-empty string")

    if 'content' in data:
        if not isinstance(data['content'], dict):
            errors.append("content must be an object")
        else:
            # Validate content structure
            content_errors = validate_content_structure(data['content'])
            errors.extend(content_errors)

    # Validate customizations if present
    if 'customizations' in data:
        if not isinstance(data['customizations'], dict):
            errors.append("customizations must be an object")
        else:
            custom_errors = validate_customizations(data['customizations'])
            errors.extend(custom_errors)

    return errors


def validate_content_structure(content: Dict[str, Any]) -> List[str]:
    """
    Validate the content structure for resume data.

    Args:
        content: Content dictionary

    Returns:
        List of validation error messages
    """
    errors = []

    # Check personal info
    if 'personalInfo' in content:
        if not isinstance(content['personalInfo'], dict):
            errors.append("personalInfo must be an object")
        else:
            personal_info = content['personalInfo']
            if 'name' not in personal_info:
                errors.append("personalInfo.name is required")
            if 'email' not in personal_info:
                errors.append("personalInfo.email is required")

    # Check experience array
    if 'experience' in content:
        if not isinstance(content['experience'], list):
            errors.append("experience must be an array")
        else:
            for i, exp in enumerate(content['experience']):
                if not isinstance(exp, dict):
                    errors.append(f"experience[{i}] must be an object")
                    continue

                required_exp_fields = ['title', 'company']
                for field in required_exp_fields:
                    if field not in exp:
                        errors.append(f"experience[{i}].{field} is required")

    # Check education array
    if 'education' in content:
        if not isinstance(content['education'], list):
            errors.append("education must be an array")
        else:
            for i, edu in enumerate(content['education']):
                if not isinstance(edu, dict):
                    errors.append(f"education[{i}] must be an object")
                    continue

                required_edu_fields = ['degree', 'school']
                for field in required_edu_fields:
                    if field not in edu:
                        errors.append(f"education[{i}].{field} is required")

    # Check skills array
    if 'skills' in content:
        if not isinstance(content['skills'], list):
            errors.append("skills must be an array")
        else:
            for i, skill in enumerate(content['skills']):
                if not isinstance(skill, str):
                    errors.append(f"skills[{i}] must be a string")

    return errors


def validate_customizations(customizations: Dict[str, Any]) -> List[str]:
    """
    Validate customization options.

    Args:
        customizations: Customizations dictionary

    Returns:
        List of validation error messages
    """
    errors = []

    # Validate color scheme
    if 'colorScheme' in customizations:
        valid_colors = ['blue', 'green', 'red', 'purple', 'orange', 'gray', 'black']
        if customizations['colorScheme'] not in valid_colors:
            errors.append(f"colorScheme must be one of: {', '.join(valid_colors)}")

    # Validate font family
    if 'fontFamily' in customizations:
        valid_fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Calibri', 'Georgia']
        if customizations['fontFamily'] not in valid_fonts:
            errors.append(f"fontFamily must be one of: {', '.join(valid_fonts)}")

    # Validate sections array
    if 'sections' in customizations:
        if not isinstance(customizations['sections'], list):
            errors.append("sections must be an array")
        else:
            valid_sections = [
                'summary', 'experience', 'education',
                'skills', 'certifications', 'projects'
            ]
            for section in customizations['sections']:
                if section not in valid_sections:
                    errors.append(f"Invalid section: {section}")

    return errors


def sanitize_latex_content(content: str) -> str:
    """
    Sanitize content for LaTeX compilation by escaping special characters.

    Args:
        content: Raw content string

    Returns:
        LaTeX-safe content string
    """
    # LaTeX special characters that need escaping
    special_chars = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '^': r'\textasciicircum{}',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '\\': r'\textbackslash{}'
    }

    result = content
    for char, escaped in special_chars.items():
        result = result.replace(char, escaped)

    return result
