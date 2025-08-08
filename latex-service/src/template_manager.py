"""
Template management service.

This module handles loading, validation, and management of LaTeX templates.
"""

import json
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path

from utils.error_handling import TemplateNotFoundError, InvalidTemplateError

logger = logging.getLogger(__name__)


class TemplateManager:
    """Manages LaTeX resume templates."""

    def __init__(self):
        self.templates_dir = Path('/app/templates')
        self._template_cache = {}
        self._scan_templates()

    def _scan_templates(self):
        """Scan the templates directory and cache template metadata."""
        logger.info("Scanning for available templates...")

        if not self.templates_dir.exists():
            logger.warning(f"Templates directory {self.templates_dir} does not exist")
            return

        for template_dir in self.templates_dir.iterdir():
            if template_dir.is_dir():
                try:
                    metadata_file = template_dir / 'metadata.json'
                    if metadata_file.exists():
                        with open(metadata_file, 'r', encoding='utf-8') as f:
                            metadata = json.load(f)

                        template_id = template_dir.name
                        self._template_cache[template_id] = {
                            'id': template_id,
                            'path': template_dir,
                            'metadata': metadata,
                            'loaded': False,
                            'latex_source': None
                        }
                        logger.info(f"Found template: {template_id}")
                    else:
                        logger.warning(f"Template {template_dir.name} missing metadata.json")
                except Exception as e:
                    logger.error(f"Error scanning template {template_dir.name}: {str(e)}")

        logger.info(f"Scanned {len(self._template_cache)} templates")

    def list_templates(self) -> List[Dict[str, Any]]:
        """
        Get list of available templates with basic information.

        Returns:
            List of template information dictionaries
        """
        templates = []

        for template_id, template_data in self._template_cache.items():
            metadata = template_data['metadata']
            template_info = {
                'id': template_id,
                'name': metadata.get('name', template_id),
                'description': metadata.get('description', ''),
                'category': metadata.get('category', 'general'),
                'version': metadata.get('version', '1.0'),
                'author': metadata.get('author', ''),
                'tags': metadata.get('tags', []),
                'preview_available': (template_data['path'] / 'preview.png').exists()
            }
            templates.append(template_info)

        return sorted(templates, key=lambda x: x['name'])

    def get_template_info(self, template_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific template.

        Args:
            template_id: Template identifier

        Returns:
            Template information dictionary or None if not found
        """
        if template_id not in self._template_cache:
            return None

        template_data = self._template_cache[template_id]
        metadata = template_data['metadata']

        # Get additional details
        template_path = template_data['path']
        styles_dir = template_path / 'styles'

        available_styles = []
        if styles_dir.exists():
            available_styles = [f.stem for f in styles_dir.glob('*.tex')]

        return {
            'id': template_id,
            'name': metadata.get('name', template_id),
            'description': metadata.get('description', ''),
            'category': metadata.get('category', 'general'),
            'version': metadata.get('version', '1.0'),
            'author': metadata.get('author', ''),
            'tags': metadata.get('tags', []),
            'variables': metadata.get('variables', []),
            'customizations': metadata.get('customizations', {}),
            'available_styles': available_styles,
            'preview_available': (template_path / 'preview.png').exists(),
            'last_modified': template_path.stat().st_mtime
        }

    def load_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """
        Load a template with its LaTeX source code.

        Args:
            template_id: Template identifier

        Returns:
            Complete template data including LaTeX source

        Raises:
            TemplateNotFoundError: If template doesn't exist
            InvalidTemplateError: If template is malformed
        """
        if template_id not in self._template_cache:
            raise TemplateNotFoundError(f"Template '{template_id}' not found")

        template_data = self._template_cache[template_id]

        # Return cached version if already loaded
        if template_data['loaded'] and template_data['latex_source']:
            return template_data.copy()

        try:
            # Load LaTeX source
            template_path = template_data['path']
            tex_file = template_path / 'template.tex'

            if not tex_file.exists():
                raise InvalidTemplateError(f"Template file not found: {tex_file}")

            with open(tex_file, 'r', encoding='utf-8') as f:
                latex_source = f.read()

            # Load and include style files
            latex_source = self._include_style_files(latex_source, template_path)

            # Validate template
            self._validate_template(latex_source, template_data['metadata'])

            # Cache the loaded template
            template_data['latex_source'] = latex_source
            template_data['loaded'] = True

            logger.info(f"Loaded template: {template_id}")

            return template_data.copy()

        except Exception as e:
            if isinstance(e, (TemplateNotFoundError, InvalidTemplateError)):
                raise
            raise InvalidTemplateError(f"Error loading template '{template_id}': {str(e)}")

    def _include_style_files(self, latex_source: str, template_path: Path) -> str:
        """
        Process style file includes in LaTeX source.

        Args:
            latex_source: Base LaTeX source
            template_path: Path to template directory

        Returns:
            LaTeX source with style files included
        """
        styles_dir = template_path / 'styles'
        if not styles_dir.exists():
            return latex_source

        # Look for style include patterns like %INCLUDE:colors.tex
        lines = latex_source.split('\n')
        processed_lines = []

        for line in lines:
            if line.strip().startswith('%INCLUDE:'):
                style_file = line.strip()[9:].strip()  # Remove '%INCLUDE:' prefix
                style_path = styles_dir / style_file

                if style_path.exists():
                    try:
                        with open(style_path, 'r', encoding='utf-8') as f:
                            style_content = f.read()
                        processed_lines.append(f"% Included from {style_file}")
                        processed_lines.append(style_content)
                        processed_lines.append(f"% End include {style_file}")
                        logger.debug(f"Included style file: {style_file}")
                    except Exception as e:
                        logger.error(f"Error including style file {style_file}: {str(e)}")
                        processed_lines.append(line)  # Keep original line
                else:
                    logger.warning(f"Style file not found: {style_file}")
                    processed_lines.append(line)  # Keep original line
            else:
                processed_lines.append(line)

        return '\n'.join(processed_lines)

    def _validate_template(self, latex_source: str, metadata: Dict[str, Any]):
        """
        Validate that a template is properly structured.

        Args:
            latex_source: LaTeX source code
            metadata: Template metadata

        Raises:
            InvalidTemplateError: If template validation fails
        """
        # Check for required LaTeX structure
        required_elements = [
            '\\documentclass',
            '\\begin{document}',
            '\\end{document}'
        ]

        for element in required_elements:
            if element not in latex_source:
                raise InvalidTemplateError(f"Template missing required element: {element}")

        # Validate that declared variables exist in template
        declared_variables = metadata.get('variables', [])
        for var in declared_variables:
            var_pattern = f"{{{{{var}}}}}"
            if var_pattern not in latex_source:
                logger.warning(f"Declared variable {var} not found in template")

        # Check for common LaTeX syntax issues
        open_braces = latex_source.count('{')
        close_braces = latex_source.count('}')
        if open_braces != close_braces:
            raise InvalidTemplateError(f"Mismatched braces: {open_braces} open, {close_braces} close")

        logger.debug("Template validation passed")

    def reload_templates(self):
        """Reload all templates from disk."""
        logger.info("Reloading templates...")
        self._template_cache.clear()
        self._scan_templates()

    def get_template_preview(self, template_id: str) -> Optional[bytes]:
        """
        Get template preview image.

        Args:
            template_id: Template identifier

        Returns:
            Preview image bytes or None if not available
        """
        if template_id not in self._template_cache:
            return None

        template_path = self._template_cache[template_id]['path']
        preview_file = template_path / 'preview.png'

        if preview_file.exists():
            try:
                with open(preview_file, 'rb') as f:
                    return f.read()
            except Exception as e:
                logger.error(f"Error reading preview image: {str(e)}")

        return None
