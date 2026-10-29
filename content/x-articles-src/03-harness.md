*Grok Bot salió y en siete semanas Meta y OpenAI salieron detrás con lo mismo. Mientras el escalado bruto rinde cada vez menos, la ventaja se arma alrededor del modelo.*

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/2230a17814eabcd5f487c872866579c2eaa154b6f2665b3b1af52829ed22d382.png)

Hace un año, la pregunta era qué modelo era el más inteligente. Hoy, cuando me siento a armar algo, me pregunto otra cosa: **qué producto me cierra el laburo, cuánto me cuesta cada tarea terminada y qué tan rápido responde**. Esa diferencia, que parece chica, cambia todo el tablero. Va mi lectura de builder sobre lo que pasó en estos últimos meses.

## 1. Cinco meses que reordenaron todo

- **Mayo 2026.** Google presenta Gemini Spark en su I/O: un agente personal 24/7 que corre en máquinas virtuales en la nube. Arranca con testers y suscriptores Ultra en Estados Unidos.
- **Mayo 2026.** SpaceXAI lanza Grok Build, su CLI agente de código, en beta.
- **Agosto 2026.** Sale Grok Bot: agentes que trabajan todo el día con su propia compu en la nube, metidos en tus apps.
- **Septiembre 2026.** Meta lanza Muse, un agente que se conecta a tu mail, calendario y pagos y corre en su propia máquina virtual (AP).
- **Septiembre 2026.** En su DevDay, OpenAI presenta Dots: agentes siempre encendidos, con su propia computadora en la nube.

**Tres labs, el mismo tipo de producto, siete semanas de diferencia.**

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/4094ab2d9ac841695300979ed016ba08e128d8c40628641302747dd40d77d15f.png)

Para ser justo: Google mostró la idea antes, en mayo, y la fue abriendo de a poco. Lo que veo es que SpaceXSI (ex xAI) fue la que puso el @bot en manos de la gente con más fuerza en agosto mediante @cursor_ai, y Meta y OpenAI salieron detrás en septiembre con productos casi calcados.

## 2. Por qué todos apuntan al mismo lugar

Si los labs más grandes llegan al mismo producto en semanas, la explicación más simple es que **el modelo solo ya no alcanza para diferenciarse**.

Los números lo muestran. Según el AI Index 2026 de Stanford, en **marzo 2026** los cuatro primeros modelos de Arena estaban dentro de 25 puntos Elo. Un estudio sobre 60 benchmarks encontró que casi la mitad ya están saturados. Cuando todos sacan más o menos la misma nota, la nota deja de decidir.

Ilya Sutskever lo dijo así en la charla con Dwarkesh Patel:

> Se terminó la era del escalado y volvemos a la era de la investigación.

Días después aclaró en X que el escalado va a seguir mejorando cosas (The Decoder). Me parece importante decirlo: el escalado sigue sumando, pero cada salto cuesta mucho más y se nota menos en el producto final.

## 3. El harness: todo lo que rodea al modelo

Le digo *harness* a todo lo que envuelve al modelo y lo vuelve útil:

- **Herramientas** que puede usar: apps, APIs, navegador.
- **Memoria** que sobrevive entre sesiones.
- **Contexto**: qué ve en cada paso.
- **Agentes** que corren en paralelo.
- **CLI**: la terminal donde vive y escribe código.
- **Compu propia** en la nube, con permisos.

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/94315ff369462c941bcb5864b2fae16bf8e176547e717ca7dfa91090b925c83f.png)

Google ya lo dice con todas las letras: Spark *"usa el harness de Antigravity"*, según su propio blog. La palabra pasó de la jerga de los builders al anuncio oficial.

Y fijate la receta común. Grok Bot, Spark, Muse y Dots comparten lo mismo: una máquina propia en la nube, acceso a tus apps, memoria entre conversaciones y un pedido de permiso antes de lo sensible. El modelo de abajo puede cambiar. **Lo que el usuario siente es el harness.**

## 4. Grok Build y el CLI: acá no fueron primeros

Grok Build salió en **mayo 2026**, como beta para los planes Heavy y ahora es open source (Bloomberg).

Lo interesante es que el CLI fue el laboratorio del harness. Ahí se aprendió a darle herramientas al modelo, a manejar contexto largo, a correr subagentes y a verificar el trabajo antes de devolverlo. Los bots 24/7 de este año son esa misma receta sacada de la terminal y llevada a tus apps.

Como builder, lo veo todos los días. Cambio de modelo y el resultado se mueve un poco. Cambio cómo le doy contexto, qué herramientas tiene y cómo verifica su trabajo, y el resultado se mueve muchísimo.

## 5. Abajo del capó: arquitectura para bajar costos

La otra mitad de la pelea está debajo. La mejora que más se siente hoy viene de la arquitectura:

- **Mezcla de expertos (MoE):** solo se activa una parte del modelo por token.
- **Destilación:** lo que sabe un modelo grande pasa a uno chico.
- **Razonamiento en inferencia:** gasta cómputo solo cuando la pregunta lo pide.
- **Modelos chicos y rápidos** para el grueso de las tareas.

Esto importa mucho para un bot que trabaja 24/7. Un agente hace decenas de llamadas por tarea, todo el día. Si cada llamada es cara o lenta, el producto no cierra.

![](https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/40e51ab7a5d98cc0807e1c5c1d7317955062a6a4b43740e315f6ecf3be1f40e5.png)

Los datos acompañan. Epoch AI mide que el precio para alcanzar un mismo nivel de rendimiento cae **entre 9 y 900 veces por año** según la tarea, con una mediana de 50 veces. Otro trabajo estima caídas de 5 a 10 veces por año en la frontera, y unas 3 veces por año atribuibles solo a mejoras algorítmicas. Sin esa caída, ningún agente siempre encendido sería negocio.

## 6. Lo que cambia para los que construimos

Si el modelo más inteligente pesa cada vez menos en la decisión, hoy miro tres cosas cuando elijo stack:

1. **Costo por tarea terminada.** El precio por token engaña: un modelo barato que necesita cinco intentos puede salir más caro que uno caro que acierta de una.
2. **Velocidad del loop.** Si cada paso tarda, la experiencia se cae.
3. **Calidad del harness.** Herramientas, memoria, contexto y verificación. Ahí se gana o se pierde la mayor parte.

Mi apuesta: **va a ganar el que te cierre el laburo rápido y barato**. @SpaceXSI viene mostrando que mover rápido en producto rinde, y el resto sale detrás en semanas. Esa misma velocidad le pone presión: si un bot se replica en siete semanas, la ventaja dura poco y hay que volver a ganarla cada vez. Para los que construimos es una buena noticia: más competencia en el harness y en el costo significa mejores herramientas y más baratas.

Ahora les pregunto a ustedes: **¿con qué stack están armando agentes y qué les pesa más al elegir, el modelo o todo lo que lo rodea?**

## Fuentes

- Gemini Spark, I/O (mayo 2026)
- Grok Build (mayo 2026)
- Grok Bot (agosto 2026)
- Meta Muse (septiembre 2026)
- OpenAI Dots (septiembre 2026)
- Nombre SpaceXSI (octubre 2026)
- Sutskever en Dwarkesh; su aclaración
- AI Index 2026, cap. 2
- Saturación de benchmarks
- Epoch AI, precios de inferencia
- Caída de precios frontier y algorítmica

---

Publicado originalmente en X: https://x.com/LaZuricata/status/2111109534441783552
