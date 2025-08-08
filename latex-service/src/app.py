#!/usr/bin/env python3
"""
LaTeX Resume Generation Service

A Flask-based microservice for generating PDF resumes from LaTeX templates.
Designed to run on Google Cloud Run with Firebase integration.
"""

import os
import logging
import json
from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest, InternalServerError
from google.cloud import logging as cloud_logging

from latex_compiler import LaTeXCompiler
from template_manager import TemplateManager
from utils.validation import validate_compile_request
from utils.error_handling import handle_error

# Initialize Flask app
app = Flask(__name__)

# Configure logging
if os.getenv('GOOGLE_CLOUD_PROJECT'):
    # Use Google Cloud Logging in production
    cloud_logging_client = cloud_logging.Client()
    cloud_logging_client.setup_logging()
else:
    # Use local logging for development
    logging.basicConfig(
        level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

logger = logging.getLogger(__name__)

# Initialize services
template_manager = TemplateManager()
latex_compiler = LaTeXCompiler()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Cloud Run."""
    return jsonify({
        'status': 'healthy',
        'service': 'latex-resume-service',
        'version': '1.0.0'
    }), 200


@app.route('/templates', methods=['GET'])
def get_templates():
    """Get list of available templates."""
    try:
        templates = template_manager.list_templates()
        return jsonify({
            'success': True,
            'templates': templates
        }), 200
    except Exception as e:
        logger.error(f"Error listing templates: {str(e)}")
        return handle_error(e, "Failed to list templates")


@app.route('/templates/<template_id>', methods=['GET'])
def get_template_info(template_id):
    """Get detailed information about a specific template."""
    try:
        template_info = template_manager.get_template_info(template_id)
        if not template_info:
            return jsonify({
                'success': False,
                'error': f'Template {template_id} not found'
            }), 404

        return jsonify({
            'success': True,
            'template': template_info
        }), 200
    except Exception as e:
        logger.error(f"Error getting template info: {str(e)}")
        return handle_error(e, "Failed to get template information")


@app.route('/compile', methods=['POST'])
def compile_resume():
    """Compile LaTeX resume from template and content."""
    try:
        # Validate request
        if not request.is_json:
            raise BadRequest("Request must be JSON")

        data = request.get_json()
        validation_errors = validate_compile_request(data)
        if validation_errors:
            return jsonify({
                'success': False,
                'error': 'Validation failed',
                'details': validation_errors
            }), 400

        # Extract parameters
        template_id = data['templateId']
        content = data['content']
        customizations = data.get('customizations', {})

        logger.info(f"Compiling resume with template: {template_id}")

        # Load template
        template = template_manager.load_template(template_id)
        if not template:
            return jsonify({
                'success': False,
                'error': f'Template {template_id} not found'
            }), 404

        # Compile LaTeX document
        result = latex_compiler.compile_resume(
            template=template,
            content=content,
            customizations=customizations
        )

        logger.info(f"Resume compiled successfully: {result.get('metadata', {})}")

        return jsonify({
            'success': True,
            'pdfBase64': result['pdf_base64'],
            'metadata': result['metadata']
        }), 200

    except BadRequest as e:
        logger.warning(f"Bad request: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error compiling resume: {str(e)}")
        return handle_error(e, "Failed to compile resume")


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    debug = os.getenv('FLASK_ENV') == 'development'

    logger.info(f"Starting LaTeX service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
