# 🦀 Sesión inicial de Rust

Bienvenido a tu primera sesión para aprender a programar usando **Rust**.
Este proyecto es un mini-curso práctico: en vez de solo leer teoría, vas a
ejecutar código real y modificarlo.

## ¿Por qué Rust?

Rust es un lenguaje moderno que combina:

- **Velocidad** de C/C++ (sin recolector de basura).
- **Seguridad de memoria** garantizada en tiempo de compilación: el
  compilador atrapa errores que en otros lenguajes explotan en producción.
- **Herramientas excelentes**: `cargo` gestiona el proyecto, dependencias,
  compilación y pruebas, todo en un solo comando.

Es un poco más estricto que otros lenguajes al principio, pero esa
estrictez es justamente lo que te enseña a pensar bien desde el día uno.

## Requisitos

Necesitás tener Rust instalado. Verificá con:

```sh
rustc --version
cargo --version
```

Si no lo tenés, instalalo desde https://rustup.rs (un solo comando).

## Cómo correr la sesión

Desde la carpeta `rust-intro/`:

```sh
cargo run
```

`cargo` compila el código y ejecuta el programa. Vas a ver la salida de las
11 lecciones, una tras otra.

Otros comandos útiles:

| Comando        | Qué hace                                            |
| :------------- | :-------------------------------------------------- |
| `cargo run`    | Compila y ejecuta el programa                       |
| `cargo build`  | Solo compila (deja el binario en `target/`)         |
| `cargo check`  | Verifica que compile, sin generar binario (rápido)  |
| `cargo fmt`    | Formatea el código automáticamente                  |
| `cargo clippy` | Linter: sugiere mejoras idiomáticas                 |

## Contenido de la sesión

Todo el código está en [`src/main.rs`](src/main.rs), dividido en lecciones
comentadas paso a paso:

1. **Variables y mutabilidad** — `let`, `mut`, shadowing.
2. **Tipos de datos** — enteros, flotantes, `bool`, `char`, tuplas, arreglos.
3. **Funciones** — parámetros, valores de retorno.
4. **Control de flujo** — `if`/`else` y el poderoso `match`.
5. **Bucles** — `for`, `while`, `loop`.
6. **Ownership** — el concepto estrella de Rust: propiedad y préstamos (`&`).
7. **Structs** — crear tus propios tipos con métodos.
8. **Enums y `Option`** — manejar casos y la ausencia de valor sin `null`.
9. **Colecciones** — `Vec` e iteradores (`map`, `filter`, `sum`).
10. **Manejo de errores** — `Result` con `Ok` / `Err`.
11. **Ejercicio final** — FizzBuzz, juntando todo lo aprendido.

## 👉 Tu turno (practicá)

La mejor forma de aprender es modificar y volver a correr. Algunas ideas:

- En la **Lección 1**, cambiá tu nombre y tu edad.
- En la **Lección 5**, hacé que la cuenta regresiva empiece en 10.
- En la **Lección 7**, agregá un campo `ciudad` al struct `Persona`.
- En la **Lección 11 (FizzBuzz)**, cambiá el rango a `1..=30` y agregá una
  regla nueva (por ejemplo, "Bazz" para múltiplos de 7).

Después de cada cambio, ejecutá `cargo run` y observá el resultado. Si te
equivocás, el compilador de Rust te va a explicar **qué** pasó y **dónde**:
leé esos mensajes, son de los mejores de cualquier lenguaje.

## Próximos pasos

Cuando termines esta sesión, los mejores recursos para seguir son:

- 📘 **The Rust Book** (oficial, gratis): https://doc.rust-lang.org/book/
- 🦀 **Rustlings** (ejercicios interactivos): https://rustlings.rust-lang.org/
- 🎮 **Rust by Example**: https://doc.rust-lang.org/rust-by-example/

¡Felices crashes evitados en compilación! 🦀
