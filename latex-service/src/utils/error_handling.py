"""
Error handling utilities for LaTeX service.
"""

import logging
from typing import Any
from flask import jsonify

logger = logging.getLogger(__name__)


def handle_error(exception: Exception, context: str = None) -> tuple:
    """
    Handle exceptions and return appropriate Flask response.

    Args:
        exception: The exception to handle
        context: Additional context for the error

    Returns:
        Tuple of (response, status_code)
    """
    error_message = str(exception)

    if context:
        full_message = f"{context}: {error_message}"
    else:
        full_message = error_message

    logger.error(full_message, exc_info=True)

    # Don't expose internal error details in production
    public_message = "An internal error occurred"
    if logger.level <= logging.DEBUG:
        public_message = full_message

    return jsonify({
        'success': False,
        'error': public_message
    }), 500


def handle_latex_error(latex_output: str) -> dict:
    """
    Parse LaTeX compilation errors and return structured error information.

    Args:
        latex_output: Raw LaTeX compilation output

    Returns:
        Dictionary with error details
    """
    error_info = {
        'type': 'compilation_error',
        'message': 'LaTeX compilation failed',
        'details': []
    }

    lines = latex_output.split('\n')

    for i, line in enumerate(lines):
        line = line.strip()

        # Look for common LaTeX error patterns
        if line.startswith('!'):
            # LaTeX error line
            error_detail = {
                'line_number': i + 1,
                'error': line[1:].strip(),
                'context': []
            }

            # Get surrounding context
            context_start = max(0, i - 2)
            context_end = min(len(lines), i + 3)
            for j in range(context_start, context_end):
                if j != i:
                    error_detail['context'].append(lines[j])

            error_info['details'].append(error_detail)

        elif 'Error:' in line:
            error_info['details'].append({
                'line_number': i + 1,
                'error': line,
                'context': []
            })

    return error_info


class LaTeXCompilationError(Exception):
    """Custom exception for LaTeX compilation errors."""

    def __init__(self, message: str, latex_output: str = None):
        super().__init__(message)
        self.latex_output = latex_output
        self.error_details = None

        if latex_output:
            self.error_details = handle_latex_error(latex_output)


class TemplateNotFoundError(Exception):
    """Custom exception for missing templates."""
    pass


class InvalidTemplateError(Exception):
    """Custom exception for invalid template structure."""
    pass
