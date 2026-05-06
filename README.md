# 1. Datos de Actividad - Charagua 1.0
Con el objetivo de generar datos espaciales de calidad que permitan cuantificar la extension y definir la temporalidad de la Deforestación y los Bosque Quemados se plantea una metodologia de mapeo anual para el municipio de Charagua, en Santa Cruz, Bolivia, a partir de clasificacion supervisada de imagenes Landsat, Random forest y ejercicios de post-clasificacion.

Enlace: [Limite Charagua](https://code.earthengine.google.com/a67b00150abeb0f3d47cec8e8e57eb6c)
## 1.1. Construcción de Mosaicos
Se desarrollaron algoritmos en GEE para la construccion de Mosaicos HLS armonizados, utilizando colecciones de imagenes (Landsat 8, Landsat 9 y Sentinel-2) aplicando filtros espaciales,temporales y de nubosidad, asi como la aplicacion de mascaras adicionales y el calculo de NBR y su inverso para construir el Mosaico AQM con valores mas altos de NBR inverso. 
## 1.2. Clasificación
La clasificacion Anual de Deforestacion y Bosque quemado, es resuldo de la ejecucion de algoritmos desarrollados para cada tarea esoecifica.
### 1.2.1. Deforestación 
Este algoritmo permite realizar la captura de muestras de entrenamiento de dos clases **deforestación y no deforestación** para Randon Forest (definicion de 100 a 500 arboles de decisión) a partir de la interpretacion de los mosaicos AQM y criterios de interpretación. 
### 1.2.2. Mascara de Bosques 
Para la construccion de la Macara de Bosques (año 0) se realizo un comparacion entre varios productos, posteriormente se analiza el acuerdo de mapeo de bosques, entre diferentes productos derivados de datos satelitales.
## 1.3. PostClasificación
Edición QGIS
## 1.4. Ensamble 1.0 (Bosque Quemado)
La union con la cobertura de Boque y Mapbiomas quemas
## 1.5. Filtro Espacial
Filtro que se realizo en GEE
## 1.6. Ensamble 2.0 (Consistencia Temporal)
Tras el filtro espacial se ha realizado un ensamble de todos los años
