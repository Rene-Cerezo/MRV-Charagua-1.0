/*=================================================================================================================
                    ENSAMBLE 2 (Consistencia Temporal)

 Descripción:
 Este script genera ensamblajes temáticos anuales corregidos y filtrados a
 una unidad mínima cartografiable equivalente a 1 hectárea, integrando
 información de bosque intacto, deforestación y bosque quemado para el área
 de estudio buscando la consistencia temporal entre coberturas, correccion de
 superposiciones de eventos de deforestación y eliminar falsas detecciones.
 
 Flujo de procesamiento:
   1. Carga de ensamblajes anuales previamente filtrados y corregidos
      (2017–2025).
   2. Extracción temática de:
        - Deforestación
        - Bosque quemado
        - Bosque base
   3. Generación de capas anuales de deforestación.
   4. Corrección temporal de deforestación mediante asignación
       del año de ocurrencia.
   5. Integración multitemporal de deforestación.
   6. Corrección de falsa deforestación utilizando la cobertura base de
      bosque 2017.
   7. Reconstrucción secuencial de bosque anual, mediante remoción
      acumulativa de áreas deforestadas.
   8. Corrección temática de bosque quemado utilizando máscaras de bosque
      coherente.
   9. Identificación de bosque intacto excluyendo áreas quemadas.
  10. Construcción de ensamblajes finales anuales.
 
 Datos de Entrada:
   MapBiomas Bolivia Collection 3
   Harmonized Landsat and Sentinel-2

 Resolución:            30 metros 
 Sistema de Referencia: EPSG:4326
 Fecha de creación:     Marzo 2026
 Autor:                 Equipo MRV - Bolivia
 / =====================================================================================*/

// FINALES FILTRADOS A 1 HA
// Bosques 2017
var final17 = ee.Image("projects/ee-rrcp2/assets/final17_v1b_")
var final18 = ee.Image("projects/ee-rrcp2/assets/final18_v1b_")
var final19 = ee.Image("projects/ee-rrcp2/assets/final19_v1b_")
var final20 = ee.Image("projects/ee-rrcp2/assets/final20_v1b_")
var final21 = ee.Image("projects/ee-rrcp2/assets/final21_v1b_")
var final22 = ee.Image("projects/ee-rrcp2/assets/final22_v1b_")
var final23 = ee.Image("projects/ee-rrcp2/assets/final23_v1b_")
var final24 = ee.Image("projects/ee-rrcp2/assets/final24_v1b_")
var final25 = ee.Image("projects/ee-rrcp2/assets/final25_v1b_")

// Deforestacion
var defF2018 = final18.eq(2)
var defF2019 = final19.eq(2)
var defF2020 = final20.eq(2)
var defF2021 = final21.eq(2)
var defF2022 = final22.eq(2)
var defF2023 = final23.eq(2)
var defF2024 = final24.eq(2)
var defF2025 = final25.eq(2)
// Bosques quemados
var BosqueQuemadoF2018 = final18.eq(5)
var BosqueQuemadoF2019 = final19.eq(5)
var BosqueQuemadoF2020 = final20.eq(5)
var BosqueQuemadoF2021 = final21.eq(5)
var BosqueQuemadoF2022 = final22.eq(5)
var BosqueQuemadoF2023 = final23.eq(5)
var BosqueQuemadoF2024 = final24.eq(5)
var BosqueQuemadoF2025 = final25.eq(5)
// revision para encontrar sobreposiciones
var defoall = defF2018.add(defF2019).add(defF2020).add(defF2021).add(defF2022).add(defF2023).add(defF2024).add(defF2025)

// Deforestación corregida temporalmente
var defF2018_c = defF2018.remap([1],[2018],0).updateMask(defF2018)
var defF2019_c = defF2019.remap([1],[2019],0).updateMask(defF2019)
var defF2020_c = defF2020.remap([1],[2020],0).updateMask(defF2020)
var defF2021_c = defF2021.remap([1],[2021],0).updateMask(defF2021)
var defF2022_c = defF2022.remap([1],[2022],0).updateMask(defF2022)
var defF2023_c = defF2023.remap([1],[2023],0).updateMask(defF2023)
var defF2024_c = defF2024.remap([1],[2024],0).updateMask(defF2024)
var defF2025_c = defF2025.remap([1],[2025],0).updateMask(defF2025)

// Deforestacion para eliminar las sobrepociones
var defFALL_c = ee.ImageCollection([defF2025_c, defF2024_c,defF2023_c,defF2022_c,defF2021_c,defF2020_c,defF2019_c,defF2018_c]).mosaic();

// Deforestación corregida por falsa deforestación
var defFALL_c_2 = defFALL_c.multiply(final17)

// Split a la deforestación para visualizacion separada
var defF2018_c2 = defFALL_c_2.eq(2018).unmask(0).remap([1],[2],0)
var defF2019_c2 = defFALL_c_2.eq(2019).unmask(0).remap([1],[2],0)
var defF2020_c2 = defFALL_c_2.eq(2020).unmask(0).remap([1],[2],0)
var defF2021_c2 = defFALL_c_2.eq(2021).unmask(0).remap([1],[2],0)
var defF2022_c2 = defFALL_c_2.eq(2022).unmask(0).remap([1],[2],0)
var defF2023_c2 = defFALL_c_2.eq(2023).unmask(0).remap([1],[2],0)
var defF2024_c2 = defFALL_c_2.eq(2024).unmask(0).remap([1],[2],0)
var defF2025_c2 = defFALL_c_2.eq(2025).unmask(0).remap([1],[2],0)

// Bosques con 1 hectarea y coherente con la deforestacion 
var bosque1ha2018 = final17.subtract(defFALL_c_2.eq(2018).unmask(0))
var bosque1ha2019 = bosque1ha2018.subtract(defFALL_c_2.eq(2019).unmask(0))
var bosque1ha2020 = bosque1ha2019.subtract(defFALL_c_2.eq(2020).unmask(0))
var bosque1ha2021 = bosque1ha2020.subtract(defFALL_c_2.eq(2021).unmask(0))
var bosque1ha2022 = bosque1ha2021.subtract(defFALL_c_2.eq(2022).unmask(0))
var bosque1ha2023 = bosque1ha2022.subtract(defFALL_c_2.eq(2023).unmask(0))
var bosque1ha2024 = bosque1ha2023.subtract(defFALL_c_2.eq(2024).unmask(0))
var bosque1ha2025 = bosque1ha2024.subtract(defFALL_c_2.eq(2025).unmask(0))

// Bosque Quemado corregido con Bosque
var BosqueQuemado1ha2018_c = BosqueQuemadoF2018.remap([1],[3],0).multiply(bosque1ha2018)
var BosqueQuemado1ha2019_c = BosqueQuemadoF2019.remap([1],[3],0).multiply(bosque1ha2019)
var BosqueQuemado1ha2020_c = BosqueQuemadoF2020.remap([1],[3],0).multiply(bosque1ha2020)
var BosqueQuemado1ha2021_c = BosqueQuemadoF2021.remap([1],[3],0).multiply(bosque1ha2021)
var BosqueQuemado1ha2022_c = BosqueQuemadoF2022.remap([1],[3],0).multiply(bosque1ha2022)
var BosqueQuemado1ha2023_c = BosqueQuemadoF2023.remap([1],[3],0).multiply(bosque1ha2023)
var BosqueQuemado1ha2024_c = BosqueQuemadoF2024.remap([1],[3],0).multiply(bosque1ha2024)
var BosqueQuemado1ha2025_c = BosqueQuemadoF2025.remap([1],[3],0).multiply(bosque1ha2025)
//Bosque intacto
var BosqueIntacto1ha2018 = (bosque1ha2018.add(BosqueQuemado1ha2018_c)).eq(1) 
var BosqueIntacto1ha2019 = (bosque1ha2019.add(BosqueQuemado1ha2019_c)).eq(1)
var BosqueIntacto1ha2020 = (bosque1ha2020.add(BosqueQuemado1ha2020_c)).eq(1)
var BosqueIntacto1ha2021 = (bosque1ha2021.add(BosqueQuemado1ha2021_c)).eq(1)
var BosqueIntacto1ha2022 = (bosque1ha2022.add(BosqueQuemado1ha2022_c)).eq(1)
var BosqueIntacto1ha2023 = (bosque1ha2023.add(BosqueQuemado1ha2023_c)).eq(1)
var BosqueIntacto1ha2024 = (bosque1ha2024.add(BosqueQuemado1ha2024_c)).eq(1)
var BosqueIntacto1ha2025 = (bosque1ha2025.add(BosqueQuemado1ha2025_c)).eq(1)
// Ensamble final 0=No Bosque Intacto, 2 = Deforestación, 3=Bosque Quemado
var Ensamble2018 = BosqueIntacto1ha2018.add(defF2018_c2).add(BosqueQuemado1ha2018_c)
var Ensamble2019 = BosqueIntacto1ha2019.add(defF2019_c2).add(BosqueQuemado1ha2019_c)
var Ensamble2020 = BosqueIntacto1ha2020.add(defF2020_c2).add(BosqueQuemado1ha2020_c)
var Ensamble2021 = BosqueIntacto1ha2021.add(defF2021_c2).add(BosqueQuemado1ha2021_c)
var Ensamble2022 = BosqueIntacto1ha2022.add(defF2022_c2).add(BosqueQuemado1ha2022_c)
var Ensamble2023 = BosqueIntacto1ha2023.add(defF2023_c2).add(BosqueQuemado1ha2023_c)
var Ensamble2024 = BosqueIntacto1ha2024.add(defF2024_c2).add(BosqueQuemado1ha2024_c)
var Ensamble2025 = BosqueIntacto1ha2025.add(defF2025_c2).add(BosqueQuemado1ha2025_c)

Map.addLayer(Ensamble2018,imageVisParam3,"Ensamble2018")
Map.addLayer(Ensamble2019,imageVisParam3,"Ensamble2019")
Map.addLayer(Ensamble2020,imageVisParam3,"Ensamble2020")
Map.addLayer(Ensamble2021,imageVisParam3,"Ensamble2021")
Map.addLayer(Ensamble2022,imageVisParam3,"Ensamble2022")
Map.addLayer(Ensamble2023,imageVisParam3,"Ensamble2023")
Map.addLayer(Ensamble2024,imageVisParam3,"Ensamble2024")
Map.addLayer(Ensamble2025,imageVisParam3,"Ensamble2025")

Export.image.toDrive({
  image: Ensamble2018,
  description: 'Ensamble2018_v1b_',
  scale: 30,
  region: cuadrado,
  maxPixels: 1e9
});
Export.image.toDrive({
  image: Ensamble2019,
  description: 'Ensamble2019_v1b_',
  scale: 30,
  region: cuadrado,
  maxPixels: 1e9
});
Export.image.toDrive({
  image: Ensamble2020,
  description: 'Ensamble2020_v1b_',
  scale: 30,
  region: cuadrado,
  maxPixels: 1e9
});
Export.image.toDrive({
  image: Ensamble2021,
  description: 'Ensamble2021_v1b_',
  scale: 30,
  region: cuadrado,
  maxPixels: 1e9
});
Export.image.toDrive({
  image: Ensamble2022,
  description: 'Ensamble2022_v1b_',
  scale: 30,
  region: cuadrado,
  maxPixels: 1e9
});
Export.image.toDrive({
  image: Ensamble2023,
  description: 'Ensamble2023_v1b_',
  scale: 30,
  region: cuadrado,
  maxPixels: 1e9
});
Export.image.toDrive({
  image: Ensamble2024,
  description: 'Ensamble2024_v1b_',
  scale: 30,
  region: cuadrado,
  maxPixels: 1e9
});
Export.image.toDrive({
  image: Ensamble2025,
  description: 'Ensamble2025_v1b_',
  scale: 30,
  region: cuadrado,
  maxPixels: 1e9
});
