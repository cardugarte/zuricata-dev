Durante dos años escuché la misma frase en cada hilo de programadores: "la IA escribe código inseguro, alejate de eso". Tienen un punto y más abajo lo vamos a ver con datos. Pero mientras discutíamos eso, pasó algo más interesante: el software que escribimos los humanos durante décadas, sin una sola línea generada por un modelo, empezó a mostrar sus agujeros en público y a un ritmo que nunca vimos.

En **septiembre 2026** se publicaron **14.934 CVEs**. En un mes. En 2015 el promedio era **541 por mes**.

Y adivina quién los está encontrando.

## El gráfico que te pasaron por el grupo

Seguro viste una imagen negra con el título "CVE Tracker": una línea que se arrastra por debajo de mil CVEs por mes hasta 2016, sube despacio hasta unos 4 o 5 mil en 2024 y después se dispara casi vertical a 15 mil, con un tramo punteado al final.

Ese gráfico sale de **cve.0xosprey.com**, un tracker que se reconstruye todos los días desde la lista oficial de CVEs (el repo CVEProject/cvelistV5). El punteado es la proyección del mes en curso.

Para no repetir un gráfico ajeno, lo armé de nuevo desde la fuente: bajé el snapshot completo de cvelistV5 de **octubre 2026** (413.350 registros), dejé afuera los 18.630 rechazados y conté los 394.720 publicados por mes de publicación.

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/e2431c1c03f53845aaf869b0bd533c00d75c7b4cc4989a053a8680997f26ed6c.png)

Los números por año:

- **2015:** 6.494 CVEs
- **2020:** 18.363
- **2024:** 39.924
- **2025:** 48.151
- **2026, al corte de octubre:** 85.842, con octubre todavía abierto (13.040 en sus primeros 22 días)

FIRST, la organización que coordina a los equipos de respuesta a incidentes del mundo, ya había subido su pronóstico para 2026 en **junio 2026**. Hoy los análisis que siguen la curva, como el de FlagThis, proyectan que el año cierra por encima de **100 mil CVEs**. El doble que 2025.

## Qué es un CVE, en dos minutos

Un **CVE** es un identificador público para una vulnerabilidad concreta: CVE-2026-5194, por ejemplo, es una falsificación de certificados en wolfSSL. Sirve para que todo el mundo hable del mismo bug con el mismo nombre.

Los números los asignan las **CNA** (CVE Numbering Authorities): empresas, proyectos y organizaciones autorizadas a emitir CVEs para su propio software o para lo que investigan. Microsoft, Google Chrome, Oracle, GitHub y el kernel de Linux son CNA. Después la **NVD** del NIST enriquece cada registro con severidad y metadatos.

Ojo con esto: un CVE cuenta un bug **descubierto y reportado**. El bug existía desde el día en que alguien hizo el commit. El contador mide cuántos encontramos.

## Quién está encontrando todo esto

Acá viene la parte que incomoda a los escépticos.

- **Anthropic.** Con Claude Mythos Preview reportó zero days en todos los sistemas operativos y navegadores principales, muchos con 10 a 20 años de antigüedad. El más viejo: un bug de **27 años** en OpenBSD. Su tablero de divulgación coordinada, al corte de **octubre 2026**, lista 6.157 vulnerabilidades reportadas en 591 proyectos open source, con 92,7% de verdaderos positivos entre los hallazgos ya revisados.
- **Linux.** En **abril 2026**, Nicholas Carlini usó Claude Code para encontrar un heap overflow en el servidor NFS del kernel, introducido en 2003. Veintitrés años escondido.
- **FFmpeg.** depthfirst encontró 21 zero days en cerca de 1,5 millones de líneas de C con unos USD 1.000 de cómputo. Algunos llevaban entre 15 y 23 años ahí.
- **Google Big Sleep.** En **julio 2025** encontró una falla en SQLite (CVE-2025-6965) que Google dice haber frenado antes de que la explotaran.
- **XBOW.** En **junio 2025** fue la primera IA en llegar al puesto uno del ranking de HackerOne en Estados Unidos.
- **OpenAI Aardvark**, hoy Codex Security. Cuando lo presentaron, en **octubre 2025**, ya tenía 10 CVEs asignados en proyectos open source.
- **DARPA AIxCC.** En la final de **agosto 2025**, los sistemas autónomos encontraron 54 de 63 vulnerabilidades sembradas en 54 millones de líneas, y además 18 vulnerabilidades reales que nadie había puesto ahí.

Hice una cuenta propia y conservadora: en el campo de créditos de los CVEs publicados en 2026, al menos 423 nombran a Anthropic, Claude o Mythos, y 109 a OpenAI o Aardvark. Es un piso. La mayoría de los créditos nombran a la persona que reportó y omiten la herramienta.

El que mejor lo resumió fue Greg Kroah-Hartman, uno de los mantenedores principales del kernel, en **abril 2026**:

> "Something happened a month ago, and the world switched. Now we have real reports... All open source security teams are hitting this right now."

Traducido: algo pasó hace un mes y el mundo cambió de golpe; ahora llegan reportes reales, y le pasa a todos los equipos de seguridad open source. Willy Tarreau contó que la lista de seguridad del kernel pasó de 2 o 3 reportes por semana a **entre 5 y 10 por día**, la mayoría correctos.

Y en el mundo corporativo, el Patch Tuesday de Microsoft de **julio 2026** trajo cerca de 570 CVEs, casi el triple del récord anterior. Dustin Childs, de la Zero Day Initiative, lo describió así: "the bug apocalypse has fully descended upon us".

## La letra chica, que también juega en contra de los críticos

Seamos honestos: la IA explica una parte del salto, y otra parte importante viene de **cómo se cuenta**. Mira quién publicó los CVEs nuevos:

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/ffcc7f3b7f01eb463f5d55d139e39c3a7099193a2a349339203066ea95edb5d1.jpg)

- **El kernel de Linux se hizo CNA en febrero 2024.** En 2023 tenía 289 CVEs; en 2025, 5.674. Desde entonces el equipo del kernel le pone CVE a casi cualquier fix con impacto de seguridad.
- **VulnCheck** pasó de 38 CVEs en 2024 a 8.740 en lo que va de 2026, y según FlagThis cerca de un tercio de sus registros llevan IDs de 2024 o antes. Es catalogación de bugs viejos.
- **Oracle** empezó en **julio 2026** a emitir un CVE por cada problema corregido, en lugar de agruparlos. Pasó de 314 en 2025 a 4.153.
- **GitHub** cuadruplicó sus advisories con CVE.
- Además, NIST pasó la NVD a un modelo de enriquecimiento por triage en **abril 2026**, y en **julio 2026** el programa CVE lanzó un piloto para que Anthropic y OpenAI funcionen como CNA.

FlagThis, que hizo el análisis más fino que encontré, concluye que la contribución **autónoma** de la IA todavía es "small and growing": su clasificador solo atribuye 21 CVEs a agentes que trabajaron solos, 17 de ellos de Big Sleep. FIRST, en la misma línea, dice que la ola refleja investigación más agresiva y mejores reportes, "not a decline in software security itself".

Ahora mira qué significa eso para el argumento anti IA. Si cambiar la forma de contar multiplica los CVEs del kernel por veinte, esos bugs **ya estaban**. Oracle tenía miles de problemas corregidos agrupados bajo pocos números. El kernel parchaba agujeros de seguridad sin asignarles CVE. El código viejo siempre estuvo lleno de bichos; lo que faltaba era alguien contándolos, y ahora además hay máquinas que los buscan sin dormir.

## Código viejo, bugs viejos

Esto también tiene datos. Un estudio presentado en USENIX Security 2022 (Alexopoulos y otros) midió que una vulnerabilidad vive en promedio **unos 4 años** en el código antes de que alguien la descubra, unos 2 años en Chromium y unos 7 en OpenSSL. Y encontraron que las vulnerabilidades se descubren cada vez más viejas.

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/5654fad2d01f13ed034a83019d6b530cb617d8dedf52d63d740ba6cdc4e44dba.png)

El bug de OpenBSD tiene 27 años. El del NFS de Linux, 23. El de FFmpeg, también 2003. Todo ese código lo escribieron personas brillantes, revisado por otras personas brillantes, durante décadas. Ningún Copilot de por medio.

## El capítulo curl, o cómo pasar del slop al oro

Daniel Stenberg, creador de curl, fue durante años la cara visible del hartazgo con la IA. En **enero 2026** cerró el bug bounty de curl: el programa había encontrado 87 vulnerabilidades confirmadas y pagado más de USD 100 mil, pero la tasa de reportes válidos había caído de más del 15% a menos del 5%. "Not even one in twenty was real". Avisó que a quien mandara slop lo iban a "ban and publicly ridicule". Pocas veces leí una política de seguridad tan honesta.

Unos meses después, el mismo Stenberg escribió en LinkedIn:

> "we have stopped getting AI slop... Instead we get an ever-increasing amount of really good security reports, almost all done with the help of AI."

Según el conteo de tecunningham, curl lleva 45 divulgaciones de seguridad en 2026 contra 9 en todo 2025. OpenSSL, 39 CVEs a **agosto 2026** contra 6 en todo 2025.

La moraleja tiene gracia: el problema de curl eran los humanos que copiaban y pegaban basura de un chatbot para cobrar una recompensa. Cuando la herramienta la usan investigadores que saben lo que hacen, sale oro.

## Y sí: el código de la IA también tiene agujeros

Para que esto sea justo, los críticos merecen su sección. El **Veracode GenAI Code Security Report 2025** probó más de 100 modelos en 80 tareas y encontró fallas del OWASP Top 10 en el **45%** de los casos. En Java la tasa de falla llegó al 72%, en XSS al 86% y en log injection al 88%.

Linus Torvalds, en **octubre 2024**, resumió el clima así:

> "90% marketing and 10% reality."

Tenía razón sobre el hype. Y el mismo Torvalds dijo en esa entrevista que la IA iba a cambiar el mundo y que en unos años íbamos a ver para qué se usa en serio. Dieciocho meses después, el equipo de seguridad de su kernel recibe entre 5 y 10 reportes reales por día.

Las dos cosas son ciertas a la vez: un modelo que genera código sin revisión mete bugs, y un modelo que **lee** código con contexto encuentra los bugs que metimos nosotros. La diferencia está en cómo lo usás.

Un dato para bajar la ansiedad: más CVEs no significa más ataques en la misma proporción. VulnCheck contó 1.061 vulnerabilidades atribuidas a descubrimiento asistido por IA en la primera mitad de 2026, y solo 14 (1,3%) se explotaron en la vida real, una tasa parecida a la general. FIRST también ve el riesgo explotable plano cuando filtrás por el catálogo KEV o por EPSS.

## Qué cambia para vos

- **Parchar va a doler más.** Si tu equipo revisaba CVEs a mano, con 15 mil por mes ese proceso se rompe. Priorizá por KEV y EPSS.
- **Tus dependencias viejas son las más expuestas.** El código de hace 20 años es justo el que ahora se está leyendo con lupa.
- **La misma herramienta sirve para defenderte.** Si los atacantes y los investigadores ya escanean tu código con modelos, conviene que lo escanees vos primero.

## Cierre

Durante años el debate fue "la IA escribe código inseguro". Mientras tanto, la IA se puso a leer el código que escribimos nosotros y encontró bugs de 23 y 27 años en Linux, OpenBSD y FFmpeg. El contador de CVEs pasó de 541 por mes en 2015 a casi 15 mil en **septiembre 2026**.

El software humano nunca fue tan seguro como creíamos. Ahora por fin lo estamos viendo.

Vos de qué lado de la lupa preferís estar?

## Fuentes

- CVE Tracker, el gráfico original:
- CVEProject/cvelistV5 (datos crudos, cálculo propio):
- FlagThis, análisis del salto de CVEs por CNA:
- jgamblin/monthlyCVEStats:
- FIRST, pronóstico de vulnerabilidades 2026:
- tecunningham, datos de descubrimiento con IA:
- Anthropic, Claude Mythos Preview:
- Anthropic, tablero de divulgación coordinada:
- Anthropic, Project Glasswing:
- InfoQ, Claude Code y el bug de NFS en Linux:
- Cloud Security Alliance, depthfirst y FFmpeg:
- OpenAI, Aardvark:
- XBOW en HackerOne:
- DARPA AIxCC, resultados:
- Brinqa, Patch Tuesday CVE tracker:
- VulnCheck, State of Exploitation 1H 2026:
- Alexopoulos et al., USENIX Security 2022:
- Daniel Stenberg, el fin del bug bounty de curl:
- Daniel Stenberg en LinkedIn:
- Veracode GenAI Code Security Report 2025:
- Tom's Hardware, Torvalds y el "90% marketing":

---

Publicado originalmente en X: https://x.com/LaZuricata/status/2113989470013866345
