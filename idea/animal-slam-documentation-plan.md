# Portal Central de Documentación --- Proyecto SLAM Animal

## 1. Propósito

Este repositorio funcionará como el **punto central de entrada y
documentación** para el proyecto de investigación de SLAM desarrollado
sobre el robot **Animal**.

El proyecto está compuesto por múltiples repositorios mantenidos por
diferentes integrantes y equipos. Este repositorio **no pretende
reemplazarlos ni concentrar todo el código**, sino proporcionar una
vista unificada del sistema.

Sus objetivos principales son:

-   Dar contexto general del proyecto.
-   Documentar la arquitectura completa.
-   Mantener un catálogo de los repositorios que forman el sistema.
-   Identificar responsables de cada componente.
-   Explicar cómo interactúan hardware, software, sensores y servicios.
-   Establecer estándares comunes de documentación.
-   Facilitar el onboarding de nuevos integrantes.
-   Servir como portal interno de conocimiento.
-   Preparar la base para automatización y, eventualmente, un **Project
    Brain** asistido por IA.

------------------------------------------------------------------------

## 2. Filosofía de organización

La estrategia será mantener una arquitectura de **múltiples repositorios
independientes + un repositorio central de documentación**.

Cada repositorio continuará teniendo:

-   Su propio dueño o equipo responsable.
-   Su historial de Git.
-   Sus issues y pull requests.
-   Su ciclo de desarrollo.
-   Su README.
-   Sus releases y versiones.

El portal central mantendrá únicamente la información necesaria para
entender **cómo cada repositorio encaja dentro del proyecto completo**.

### Principio principal

> Cada repositorio es dueño de su documentación técnica detallada.\
> El portal central es dueño de la visión global del sistema.

Esto evita duplicar documentación y reduce el riesgo de mantener
información contradictoria.

------------------------------------------------------------------------

## 3. Arquitectura conceptual

El sistema puede representarse inicialmente de esta manera:

``` text
                         ┌──────────────────────┐
                         │   Proyecto Animal    │
                         │        SLAM          │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
         Hardware                Software            Infraestructura
              │                     │                     │
       ┌──────┼──────┐        ┌─────┼─────┐        ┌─────┼─────┐
       │      │      │        │     │     │        │     │     │
     LiDAR Cámaras Sensores   SLAM Visión ROS     Docker Red  Compute
```

Este diagrama evolucionará conforme se definan formalmente los
componentes.

------------------------------------------------------------------------

## 4. Repositorio central

El repositorio central puede utilizar una estructura similar a:

``` text
animal-slam-hub/
│
├── README.md
├── docs/
│   ├── introduction/
│   ├── architecture/
│   ├── repositories/
│   ├── hardware/
│   ├── software/
│   ├── infrastructure/
│   ├── standards/
│   ├── onboarding/
│   ├── research/
│   └── roadmap/
│
├── components/
│
├── scripts/
│
├── public/
│
├── app/
│
└── package.json
```

La estructura podrá crecer conforme avance el proyecto.

------------------------------------------------------------------------

## 5. Portal web

Además de poder consultar los archivos Markdown directamente desde
GitHub, se desarrollará un **portal web de documentación**.

### Stack propuesto

-   Next.js
-   React
-   Markdown / MDX
-   Fumadocs o Nextra
-   GitHub
-   GitHub Actions

La documentación deberá almacenarse principalmente como archivos
Markdown o MDX.

Next.js será la capa de presentación.

``` text
Markdown / MDX
      │
      ▼
Repositorio GitHub
      │
      ▼
Next.js Documentation Portal
      │
      ▼
Portal navegable
```

### Ventajas

Esto permitirá que la documentación:

-   Sea legible directamente desde GitHub.
-   Sea versionada mediante Git.
-   Pueda modificarse mediante Pull Requests.
-   No dependa completamente de componentes React.
-   Pueda mostrarse mediante una interfaz moderna.
-   Permita incorporar componentes React cuando realmente sean
    necesarios.

------------------------------------------------------------------------

## 6. Estructura inicial de documentación

``` text
docs/

01-introduction/
    overview.md
    goals.md
    scope.md

02-architecture/
    system-overview.md
    hardware-architecture.md
    software-architecture.md
    network-architecture.md
    data-flow.md

03-repositories/
    overview.md
    repository-catalog.md

04-hardware/
    animal.md
    lidar.md
    cameras.md
    compute.md
    sensors.md

05-software/
    ros.md
    slam.md
    vision.md
    communication.md

06-infrastructure/
    docker.md
    networking.md
    development-environment.md

07-standards/
    repository-standard.md
    readme-standard.md
    git-workflow.md
    documentation-standard.md

08-onboarding/
    getting-started.md
    development-setup.md
    project-map.md

09-research/
    papers.md
    experiments.md
    datasets.md

10-roadmap/
    roadmap.md
```

------------------------------------------------------------------------

## 7. Catálogo de repositorios

El portal tendrá un catálogo central.

Ejemplo:

  ----------------------------------------------------------------------------------
  Repositorio        Área              Responsable    Estado         Descripción
  ------------------ ----------------- -------------- -------------- ---------------
  `animal-slam`      SLAM              Equipo SLAM    Active         Algoritmos
                                                                     principales de
                                                                     SLAM

  `animal-vision`    Visión            Equipo Visión  Active         Procesamiento
                                                                     de cámaras

  `animal-lidar`     Sensores          Equipo LiDAR   Active         Integración del
                                                                     LiDAR

  `animal-network`   Redes             Equipo Redes   Development    Comunicación
                                                                     del robot

  `animal-docker`    Infraestructura   Infra Team     Development    Entorno de
                                                                     contenedores
  ----------------------------------------------------------------------------------

Cada entrada deberá enlazar al repositorio original.

------------------------------------------------------------------------

## 8. Estándar de README para todos los repositorios

Cada equipo utilizará una estructura común.

``` markdown
# Nombre del repositorio

Breve descripción del componente.

## Project

Este repositorio forma parte del proyecto **Animal SLAM**.

[← Volver al portal principal](URL_DEL_PORTAL)

## Overview

Explicación del propósito del repositorio.

## Responsibilities

Qué responsabilidades tiene este componente dentro del sistema.

## Architecture

Descripción de su arquitectura interna.

## Dependencies

Dependencias necesarias.

## Interfaces

Interfaces con otros componentes.

Ejemplos:

- ROS topics
- ROS services
- ROS actions
- APIs
- sockets
- puertos
- archivos
- sensores

## Installation

Instrucciones de instalación.

## Usage

Cómo ejecutar el proyecto.

## Configuration

Variables de entorno y archivos de configuración.

## Development

Cómo desarrollar localmente.

## Testing

Cómo ejecutar las pruebas.

## Maintainers

Responsables actuales.

## Status

Active / Development / Experimental / Deprecated

## Related repositories

Repositorios relacionados.
```

------------------------------------------------------------------------

## 9. Responsabilidad de documentación

Cada equipo será responsable de mantener actualizado el README de su
repositorio.

El portal central **no copiará toda la documentación técnica**.

Ejemplo:

``` text
Repositorio Visión
      │
      ├── implementación
      ├── instalación
      ├── configuración
      └── README detallado

             │
             ▼

Portal Central
      │
      └── visión general + enlace
```

------------------------------------------------------------------------

## 10. Cuándo actualizar el portal central

No será necesario actualizarlo por cada commit.

Debe actualizarse cuando ocurra un cambio que afecte la comprensión
global del proyecto, por ejemplo:

-   Nuevo repositorio.
-   Repositorio eliminado.
-   Cambio de responsable.
-   Cambio importante de arquitectura.
-   Nueva dependencia entre componentes.
-   Nuevo sensor.
-   Cambio de protocolo.
-   Cambio de interfaces públicas.
-   Cambio importante en el flujo de datos.

------------------------------------------------------------------------

## 11. Flujo de actualización

``` text
Developer
    │
    ▼
Actualiza componente
    │
    ▼
Actualiza README
    │
    ▼
Pull Request
    │
    ▼
Merge
    │
    ▼
¿Afecta arquitectura global?
    │
 ┌──┴──┐
 │     │
No     Sí
 │     │
Fin    ▼
    Actualizar Portal
```

------------------------------------------------------------------------

## 12. Automatización futura

GitHub Actions podrá utilizarse para reducir trabajo manual.

Posibles automatizaciones:

-   Detectar cambios en README.
-   Validar que los repositorios cumplan la plantilla.
-   Verificar enlaces rotos.
-   Consultar información mediante la API de GitHub.
-   Obtener última actualización.
-   Mostrar responsables.
-   Mostrar releases.
-   Mostrar estado del repositorio.
-   Generar automáticamente un índice de componentes.

Ejemplo conceptual:

``` text
Repositorios externos
       │
       ▼
GitHub API
       │
       ▼
Build del portal
       │
       ▼
Extraer metadata
       │
       ▼
Generar documentación
```

------------------------------------------------------------------------

## 13. No duplicar documentación

Una regla fundamental será:

> La información detallada vive lo más cerca posible del código que
> describe.

El portal central debe explicar:

``` text
QUÉ existe
POR QUÉ existe
DÓNDE está
QUIÉN lo mantiene
CÓMO se relaciona
```

El repositorio específico debe explicar:

``` text
CÓMO funciona
CÓMO instalarlo
CÓMO configurarlo
CÓMO desarrollarlo
CÓMO probarlo
```

------------------------------------------------------------------------

## 14. Submódulos de Git

Inicialmente **no se utilizarán Git Submodules como mecanismo principal
de organización**.

Los repositorios pertenecen a diferentes propietarios y tienen ciclos de
desarrollo independientes.

Los submódulos podrían evaluarse posteriormente si existe la necesidad
de reproducir una versión exacta del sistema completo.

Ejemplo futuro:

``` text
animal-workspace/
│
├── slam/
├── vision/
├── lidar/
└── communication/
```

Cada directorio podría apuntar a un commit específico de otro
repositorio.

Sin embargo, esto agrega complejidad al flujo de Git y no es necesario
para la primera versión del portal.

------------------------------------------------------------------------

## 15. Workspace reproducible

Si posteriormente se necesita descargar todos los repositorios para
ejecutar el robot, es preferible crear inicialmente herramientas de
bootstrap.

Por ejemplo:

``` bash
./scripts/bootstrap.sh
```

El script podría:

1.  Verificar dependencias.
2.  Clonar repositorios.
3.  Crear variables de entorno.
4.  Descargar configuraciones.
5.  Construir imágenes Docker.
6.  Preparar el workspace.

Para entornos ROS también puede evaluarse un archivo `.repos` y
herramientas como `vcstool`.

------------------------------------------------------------------------

## 16. Onboarding

Uno de los objetivos principales del portal será que un nuevo integrante
pueda entender rápidamente:

1.  ¿Qué es Animal?
2.  ¿Cuál es el objetivo de la investigación?
3.  ¿Qué hardware utiliza?
4.  ¿Qué software existe?
5.  ¿Cuáles son los repositorios?
6.  ¿Quién mantiene cada componente?
7.  ¿Cómo se comunican?
8.  ¿Cómo preparo mi entorno?
9.  ¿Cómo ejecuto el sistema?
10. ¿Dónde debo contribuir?

La sección de onboarding debe poder llevar a una persona desde **cero
contexto hasta ejecutar el sistema**.

------------------------------------------------------------------------

## 17. Roadmap inicial

### Fase 1 --- Foundation

-   Crear repositorio central.
-   Crear README principal.
-   Crear estructura `docs/`.
-   Inventariar repositorios existentes.
-   Identificar responsables.
-   Crear diagrama inicial de arquitectura.

### Fase 2 --- Standardization

-   Crear plantilla estándar de README.
-   Compartirla con todos los equipos.
-   Estandarizar documentación.
-   Definir convenciones de nombres.
-   Definir flujo de Pull Requests.

### Fase 3 --- Documentation Portal

-   Crear aplicación Next.js.
-   Integrar Markdown/MDX.
-   Integrar Fumadocs o Nextra.
-   Crear sidebar.
-   Crear navegación.
-   Agregar búsqueda.

### Fase 4 --- Automation

-   GitHub API.
-   GitHub Actions.
-   Metadata automática.
-   Validación de READMEs.
-   Detección de documentación potencialmente desactualizada.

### Fase 5 --- Project Brain

En una etapa posterior se podrá incorporar una capa de inteligencia
artificial.

``` text
GitHub Repositories
        │
Documentation
        │
Issues / PRs
        │
Research Papers
        │
Datasets
        │
        ▼
Knowledge Index
        │
        ▼
Semantic Search / RAG
        │
        ▼
LLM
        │
        ▼
Animal Project Brain
```

Ejemplos de preguntas:

> ¿Cómo ejecuto el sistema SLAM?

> ¿Qué nodo publica los datos del LiDAR?

> ¿Qué repositorio mantiene la comunicación de red?

> ¿Cómo se levantan los contenedores Docker?

> ¿Qué sensores utiliza Animal?

> ¿Qué experimentos se han realizado?

La calidad de esta etapa dependerá directamente de la calidad y
estructura de la documentación creada desde el inicio.

------------------------------------------------------------------------

## 18. Principios del proyecto

1.  **Documentation as Code** --- La documentación vive en Git.
2.  **Single Source of Truth** --- Evitar duplicar información.
3.  **Repository Ownership** --- Cada equipo mantiene su componente.
4.  **Discoverability** --- Toda información debe ser fácil de
    encontrar.
5.  **Consistency** --- Todos los repositorios siguen estándares
    similares.
6.  **Automation First** --- Automatizar tareas repetitivas cuando sea
    conveniente.
7.  **Loose Coupling** --- Los repositorios pueden evolucionar
    independientemente.
8.  **Clear Interfaces** --- Las conexiones entre componentes deben
    documentarse explícitamente.
9.  **Reproducibility** --- Debe ser posible reconstruir el entorno del
    proyecto.
10. **Scalable Knowledge** --- La estructura debe soportar el
    crecimiento del equipo y del proyecto.

------------------------------------------------------------------------

## 19. Resultado esperado

El proyecto terminará teniendo dos formas principales de acceso al
conocimiento:

``` text
                    Animal SLAM
                        │
             ┌──────────┴──────────┐
             │                     │
           GitHub              Documentation
             │                    Portal
             │                     │
        Developers            Team / Students
             │                     │
             └──────────┬──────────┘
                        │
                   Project Knowledge
```

GitHub seguirá siendo la fuente técnica y de versionamiento.

El portal será la interfaz amigable para navegar el conocimiento del
proyecto.
