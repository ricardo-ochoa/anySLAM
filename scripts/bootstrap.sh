#!/usr/bin/env bash
#
# bootstrap.sh — clona los repositorios del proyecto anySLAM en un workspace local.
#
# ESTADO: esqueleto funcional (fase 4 del roadmap).
# Clona lo que está en data/repositories.yaml. Todavía NO prepara el entorno ROS,
# no construye imágenes Docker ni instala dependencias: esas partes dependen de
# información que aún no está documentada.
#
# Uso:
#   ./scripts/bootstrap.sh [directorio-destino]
#
# Por defecto clona en ../anyslam-workspace

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CATALOG="$ROOT/data/repositories.yaml"
TARGET="${1:-$ROOT/../anyslam-workspace}"

info()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn()  { printf '\033[1;33m!!\033[0m %s\n' "$*" >&2; }
fail()  { printf '\033[1;31mxx\033[0m %s\n' "$*" >&2; exit 1; }

# --- 1. Verificar dependencias ------------------------------------------------
info "Verificando dependencias"
command -v git  >/dev/null || fail "git no está instalado"
command -v node >/dev/null || fail "node no está instalado (se usa para leer el catálogo)"

# --- 2. Leer el catálogo ------------------------------------------------------
[ -f "$CATALOG" ] || fail "No se encontró $CATALOG"

# Se reutiliza el paquete `yaml` que ya instala el portal.
URLS="$(node -e "
  const fs = require('node:fs');
  const yaml = require('$ROOT/node_modules/yaml');
  const data = yaml.parse(fs.readFileSync('$CATALOG', 'utf8'));
  for (const r of data.repositories) console.log(\`\${r.name}\t\${r.url}\t\${r.visibility}\`);
")" || fail "No se pudo leer el catálogo. ¿Ejecutaste 'npm install' en el portal?"

# --- 3. Clonar ----------------------------------------------------------------
info "Workspace: $TARGET"
mkdir -p "$TARGET"

failed=0
while IFS=$'\t' read -r name url visibility; do
  dest="$TARGET/$name"
  if [ -d "$dest/.git" ]; then
    info "$name — ya existe, se omite"
    continue
  fi
  info "Clonando $name"
  if ! git clone --quiet "$url" "$dest" 2>/dev/null; then
    if [ "$visibility" = "private" ]; then
      warn "$name es privado y no tienes acceso. Pídeselo a su responsable."
    else
      warn "$name no se pudo clonar desde $url"
    fi
    failed=$((failed + 1))
  fi
done <<< "$URLS"

# --- 4. Pendiente -------------------------------------------------------------
# TODO (fase 4), en cuanto la documentación exista:
#   - Crear el archivo de variables de entorno (ROS_DOMAIN_ID, rutas de activos).
#   - Descargar configuraciones compartidas (fastdds.xml, calibraciones).
#   - Construir imágenes Docker, si el proyecto llega a usarlas.
#   - Preparar el workspace de ROS 2 (colcon build).
#   - Evaluar un archivo .repos con vcstool en lugar de este script.

echo
if [ "$failed" -gt 0 ]; then
  warn "$failed repositorio(s) no se pudieron clonar (ver arriba)."
  warn "El estado de acceso está en docs/03-repositories/missing-data.mdx"
else
  info "Todos los repositorios clonados en $TARGET"
fi
