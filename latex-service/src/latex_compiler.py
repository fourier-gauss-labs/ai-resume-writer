"""
LaTeX compilation service.

This module handles the compilation of LaTeX documents into PDF format.
"""

import os
import tempfile
import subprocess
import base64
import logging
import time
from typing import Dict, Any, Optional
from pathlib import Path

from utils.error_handling import LaTeXCompilationError
from utils.validation import sanitize_latex_content

logger = logging.getLogger(__name__)


class LaTeXCompiler:
    """Handles LaTeX document compilation."""

    def __init__(self):
        self.work_dir = Path(os.getenv('LATEX_WORK_DIR', '/tmp/latex-work'))
        self.work_dir.mkdir(exist_ok=True)

        # Verify LaTeX installation
        self._verify_latex_installation()

    def _verify_latex_installation(self):
        """Verify that LaTeX is properly installed."""
        try:
            result = subprocess.run(
                ['pdflatex', '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode != 0:
                raise RuntimeError("pdflatex is not working properly")
            logger.info("LaTeX installation verified")
        except (subprocess.TimeoutExpired, FileNotFoundError) as e:
            raise RuntimeError(f"LaTeX not properly installed: {str(e)}")

    def compile_resume(
        self,
        template: Dict[str, Any],
        content: Dict[str, Any],
        customizations: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Compile a resume from template and content.

        Args:
            template: Template configuration and LaTeX source
            content: Resume content data
            customizations: Optional customization settings

        Returns:
            Dictionary with compiled PDF and metadata
        """
        start_time = time.time()

        # Create temporary working directory
        with tempfile.TemporaryDirectory(dir=self.work_dir) as temp_dir:
            temp_path = Path(temp_dir)

            try:
                # Generate LaTeX source from template and content
                latex_source = self._generate_latex_source(
                    template, content, customizations
                )

                # Write LaTeX source to file
                tex_file = temp_path / 'resume.tex'
                tex_file.write_text(latex_source, encoding='utf-8')

                # Compile LaTeX to PDF
                pdf_path = self._compile_latex(tex_file)

                # Read PDF and encode to base64
                pdf_base64 = self._encode_pdf_to_base64(pdf_path)

                compilation_time = time.time() - start_time

                # Get PDF metadata
                metadata = {
                    'pages': self._count_pdf_pages(pdf_path),
                    'compilationTime': f"{compilation_time:.2f}s",
                    'templateId': template.get('id'),
                    'templateVersion': template.get('version', '1.0'),
                    'fileSize': pdf_path.stat().st_size
                }

                logger.info(f"Successfully compiled resume in {compilation_time:.2f}s")

                return {
                    'pdf_base64': pdf_base64,
                    'metadata': metadata
                }

            except Exception as e:
                logger.error(f"Compilation failed: {str(e)}")
                raise LaTeXCompilationError(f"Failed to compile resume: {str(e)}")

    def _generate_latex_source(
        self,
        template: Dict[str, Any],
        content: Dict[str, Any],
        customizations: Dict[str, Any] = None
    ) -> str:
        """
        Generate LaTeX source code from template and content.

        Args:
            template: Template data
            content: Resume content
            customizations: Optional customizations

        Returns:
            Complete LaTeX source code
        """
        # Get base template
        latex_source = template['latex_source']

        # Apply customizations
        if customizations:
            latex_source = self._apply_customizations(latex_source, customizations)

        # Replace content variables
        latex_source = self._replace_content_variables(latex_source, content)

        return latex_source

    def _apply_customizations(self, latex_source: str, customizations: Dict[str, Any]) -> str:
        """Apply customizations to LaTeX source."""
        # This is a placeholder - implement actual customization logic
        # For example, color scheme changes, font changes, etc.

        if 'colorScheme' in customizations:
            color = customizations['colorScheme']
            # Replace color definitions in LaTeX source
            latex_source = latex_source.replace('{{PRIMARY_COLOR}}', color)

        if 'fontFamily' in customizations:
            font = customizations['fontFamily']
            # Replace font definitions
            latex_source = latex_source.replace('{{FONT_FAMILY}}', font)

        return latex_source

    def _replace_content_variables(self, latex_source: str, content: Dict[str, Any]) -> str:
        """Replace content variables in LaTeX source."""
        # Personal information
        personal_info = content.get('personalInfo', {})
        latex_source = latex_source.replace('{{NAME}}',
                                           sanitize_latex_content(personal_info.get('name', '')))
        latex_source = latex_source.replace('{{EMAIL}}',
                                           personal_info.get('email', ''))
        latex_source = latex_source.replace('{{PHONE}}',
                                           personal_info.get('phone', ''))
        latex_source = latex_source.replace('{{LOCATION}}',
                                           sanitize_latex_content(personal_info.get('location', '')))

        # Summary
        summary = content.get('summary', '')
        latex_source = latex_source.replace('{{SUMMARY}}',
                                           sanitize_latex_content(summary))

        # Experience section
        experience_latex = self._generate_experience_section(content.get('experience', []))
        latex_source = latex_source.replace('{{EXPERIENCE_SECTION}}', experience_latex)

        # Education section
        education_latex = self._generate_education_section(content.get('education', []))
        latex_source = latex_source.replace('{{EDUCATION_SECTION}}', education_latex)

        # Skills section
        skills_latex = self._generate_skills_section(content.get('skills', []))
        latex_source = latex_source.replace('{{SKILLS_SECTION}}', skills_latex)

        # Certifications section
        certs_latex = self._generate_certifications_section(content.get('certifications', []))
        latex_source = latex_source.replace('{{CERTIFICATIONS_SECTION}}', certs_latex)

        return latex_source

    def _generate_experience_section(self, experiences: list) -> str:
        """Generate LaTeX for experience section."""
        if not experiences:
            return ""

        latex_lines = []
        for exp in experiences:
            title = sanitize_latex_content(exp.get('title', ''))
            company = sanitize_latex_content(exp.get('company', ''))
            duration = sanitize_latex_content(exp.get('duration', ''))
            bullets = exp.get('bullets', [])

            latex_lines.append(f"\\experienceitem{{{title}}}{{{company}}}{{{duration}}}")

            if bullets:
                latex_lines.append("\\begin{itemize}")
                for bullet in bullets:
                    safe_bullet = sanitize_latex_content(str(bullet))
                    latex_lines.append(f"    \\item {safe_bullet}")
                latex_lines.append("\\end{itemize}")

            latex_lines.append("")  # Empty line between experiences

        return "\n".join(latex_lines)

    def _generate_education_section(self, education: list) -> str:
        """Generate LaTeX for education section."""
        if not education:
            return ""

        latex_lines = []
        for edu in education:
            degree = sanitize_latex_content(edu.get('degree', ''))
            school = sanitize_latex_content(edu.get('school', ''))
            year = sanitize_latex_content(str(edu.get('year', '')))

            latex_lines.append(f"\\educationitem{{{degree}}}{{{school}}}{{{year}}}")

        return "\n".join(latex_lines)

    def _generate_skills_section(self, skills: list) -> str:
        """Generate LaTeX for skills section."""
        if not skills:
            return ""

        safe_skills = [sanitize_latex_content(str(skill)) for skill in skills]
        return ", ".join(safe_skills)

    def _generate_certifications_section(self, certifications: list) -> str:
        """Generate LaTeX for certifications section."""
        if not certifications:
            return ""

        latex_lines = []
        for cert in certifications:
            if isinstance(cert, str):
                latex_lines.append(f"\\item {sanitize_latex_content(cert)}")
            elif isinstance(cert, dict):
                name = sanitize_latex_content(cert.get('name', ''))
                issuer = sanitize_latex_content(cert.get('issuer', ''))
                date = sanitize_latex_content(cert.get('date', ''))
                latex_lines.append(f"\\certificationitem{{{name}}}{{{issuer}}}{{{date}}}")

        return "\n".join(latex_lines)

    def _compile_latex(self, tex_file: Path) -> Path:
        """Compile LaTeX file to PDF."""
        logger.info(f"Compiling {tex_file}")

        # Run pdflatex
        result = subprocess.run(
            ['pdflatex', '-interaction=nonstopmode', '-output-directory',
             str(tex_file.parent), str(tex_file)],
            capture_output=True,
            text=True,
            cwd=tex_file.parent,
            timeout=60
        )

        pdf_file = tex_file.with_suffix('.pdf')

        if result.returncode != 0 or not pdf_file.exists():
            error_msg = f"LaTeX compilation failed:\n{result.stdout}\n{result.stderr}"
            raise LaTeXCompilationError(error_msg, result.stdout)

        return pdf_file

    def _encode_pdf_to_base64(self, pdf_path: Path) -> str:
        """Encode PDF file to base64 string."""
        with open(pdf_path, 'rb') as pdf_file:
            pdf_bytes = pdf_file.read()
            return base64.b64encode(pdf_bytes).decode('utf-8')

    def _count_pdf_pages(self, pdf_path: Path) -> int:
        """Count pages in PDF file."""
        # Simple page counting - could be improved with a proper PDF library
        try:
            with open(pdf_path, 'rb') as f:
                content = f.read().decode('latin-1')
                return content.count('/Type /Page')
        except:
            return 1  # Default to 1 page if counting fails
