// =============================================================
//  SESIÓN INICIAL DE RUST  🦀
//  Programación desde cero usando el lenguaje Rust.
//
//  Cada lección es una función. `main()` las ejecuta en orden.
//  Leé los comentarios: explican el "por qué", no solo el "qué".
//
//  Para correr todo:   cargo run
//  Para compilar:      cargo build
// =============================================================

fn main() {
    println!("===== SESIÓN INICIAL DE RUST 🦀 =====\n");

    leccion_01_variables();
    leccion_02_tipos();
    leccion_03_funciones();
    leccion_04_control_de_flujo();
    leccion_05_bucles();
    leccion_06_ownership();
    leccion_07_structs();
    leccion_08_enums_y_option();
    leccion_09_colecciones();
    leccion_10_manejo_de_errores();
    leccion_11_ejercicio_final();

    println!("\n===== ¡Fin de la sesión! Seguí en src/main.rs =====");
}

// -------------------------------------------------------------
// LECCIÓN 1: Variables y mutabilidad
// -------------------------------------------------------------
// En Rust las variables son INMUTABLES por defecto: una vez que
// les asignás un valor, no podés cambiarlo. Esto evita muchos bugs.
// Si querés poder cambiar el valor, usás la palabra `mut`.
fn leccion_01_variables() {
    println!("--- Lección 1: Variables ---");

    let nombre = "Carlos"; // inmutable
    let mut edad = 30; // mutable gracias a `mut`

    println!("Hola {nombre}, tenés {edad} años.");

    edad = edad + 1; // permitido porque es `mut`
    println!("Pasó un año, ahora tenés {edad}.");

    // "Shadowing": podés re-declarar una variable con `let`.
    // Es distinto a `mut`: creás una variable NUEVA con el mismo nombre.
    let edad = "treinta y uno"; // ahora es texto, no número
    println!("Tu edad como texto: {edad}\n");
}

// -------------------------------------------------------------
// LECCIÓN 2: Tipos de datos básicos
// -------------------------------------------------------------
// Rust es de tipado estático: cada valor tiene un tipo conocido
// en tiempo de compilación. Casi siempre Rust lo deduce solo,
// pero también podés anotarlo con `: tipo`.
fn leccion_02_tipos() {
    println!("--- Lección 2: Tipos ---");

    let entero: i32 = -42; // entero con signo de 32 bits
    let positivo: u32 = 100; // entero sin signo (no negativo)
    let decimal: f64 = 3.14; // número con coma flotante
    let booleano: bool = true; // verdadero / falso
    let caracter: char = '🦀'; // un carácter Unicode (¡emoji incluido!)
    let texto: &str = "Rust"; // una cadena de texto

    println!("entero={entero}, positivo={positivo}, decimal={decimal}");
    println!("booleano={booleano}, caracter={caracter}, texto={texto}");

    // Tuplas: agrupan valores de distintos tipos.
    let punto: (i32, i32) = (3, 7);
    println!("punto x={}, y={}", punto.0, punto.1);

    // Arreglos: tamaño fijo, todos del mismo tipo.
    let semana = ["Lun", "Mar", "Mié", "Jue", "Vie"];
    println!("primer día laboral: {}\n", semana[0]);
}

// -------------------------------------------------------------
// LECCIÓN 3: Funciones
// -------------------------------------------------------------
// Las funciones reciben parámetros (con tipo obligatorio) y pueden
// devolver un valor (con `-> tipo`). La última expresión SIN punto
// y coma es el valor de retorno.
fn leccion_03_funciones() {
    println!("--- Lección 3: Funciones ---");

    let resultado = sumar(4, 5);
    println!("4 + 5 = {resultado}");

    let area = area_rectangulo(3.0, 2.5);
    println!("área del rectángulo = {area}\n");
}

fn sumar(a: i32, b: i32) -> i32 {
    a + b // sin `;` → esto es lo que se devuelve
}

fn area_rectangulo(ancho: f64, alto: f64) -> f64 {
    ancho * alto
}

// -------------------------------------------------------------
// LECCIÓN 4: Control de flujo (if / else / match)
// -------------------------------------------------------------
fn leccion_04_control_de_flujo() {
    println!("--- Lección 4: Control de flujo ---");

    let numero = 7;

    // if / else clásico
    if numero % 2 == 0 {
        println!("{numero} es par");
    } else {
        println!("{numero} es impar");
    }

    // `if` también es una expresión: puede devolver un valor.
    let etiqueta = if numero > 5 { "grande" } else { "chico" };
    println!("{numero} es un número {etiqueta}");

    // `match`: como un `switch` pero mucho más potente y seguro.
    // El compilador te obliga a cubrir TODOS los casos.
    let dia = 3;
    let nombre_dia = match dia {
        1 => "Lunes",
        2 => "Martes",
        3 => "Miércoles",
        4 => "Jueves",
        5 => "Viernes",
        6 | 7 => "Fin de semana",
        _ => "Día inválido", // `_` = "cualquier otro caso"
    };
    println!("El día {dia} es {nombre_dia}\n");
}

// -------------------------------------------------------------
// LECCIÓN 5: Bucles (loop / while / for)
// -------------------------------------------------------------
fn leccion_05_bucles() {
    println!("--- Lección 5: Bucles ---");

    // `for` recorriendo un rango (0, 1, 2)
    print!("Cuenta con for: ");
    for i in 0..3 {
        print!("{i} ");
    }
    println!();

    // `while` mientras se cumpla una condición
    let mut cuenta_regresiva = 3;
    print!("Cuenta regresiva con while: ");
    while cuenta_regresiva > 0 {
        print!("{cuenta_regresiva} ");
        cuenta_regresiva -= 1;
    }
    println!("¡Despegue! 🚀");

    // `loop` infinito que cortamos con `break` (puede devolver valor)
    let mut n = 1;
    let primera_potencia_mayor_a_50 = loop {
        n *= 2;
        if n > 50 {
            break n; // `break` devuelve este valor
        }
    };
    println!("Primera potencia de 2 mayor a 50: {primera_potencia_mayor_a_50}\n");
}

// -------------------------------------------------------------
// LECCIÓN 6: Ownership y borrowing (¡el corazón de Rust!)
// -------------------------------------------------------------
// Rust NO tiene recolector de basura. En su lugar usa reglas de
// "propiedad" (ownership) verificadas en compilación:
//   1. Cada valor tiene un único dueño.
//   2. Cuando el dueño sale de alcance, el valor se libera.
//   3. Podés "prestar" (borrow) un valor con referencias `&`.
// Esto da seguridad de memoria SIN costo en tiempo de ejecución.
fn leccion_06_ownership() {
    println!("--- Lección 6: Ownership ---");

    let saludo = String::from("Hola mundo");

    // Prestamos `saludo` por referencia (&) en vez de transferirlo.
    // Así la función lo usa pero NO se vuelve dueña: lo seguimos teniendo.
    let largo = calcular_largo(&saludo);
    println!("'{saludo}' tiene {largo} caracteres"); // saludo sigue válido

    // Referencia mutable: permite modificar el valor prestado.
    let mut mensaje = String::from("Rust");
    agregar_emoji(&mut mensaje);
    println!("mensaje modificado: {mensaje}\n");
}

fn calcular_largo(texto: &String) -> usize {
    texto.chars().count() // solo lee, no se adueña
}

fn agregar_emoji(texto: &mut String) {
    texto.push_str(" 🦀"); // modifica el original
}

// -------------------------------------------------------------
// LECCIÓN 7: Structs (tipos propios)
// -------------------------------------------------------------
// Un `struct` agrupa datos relacionados con nombre. Con `impl`
// le agregás métodos (funciones asociadas al tipo).
struct Persona {
    nombre: String,
    edad: u32,
}

impl Persona {
    // Constructor por convención: `new`.
    fn new(nombre: &str, edad: u32) -> Persona {
        Persona {
            nombre: nombre.to_string(),
            edad,
        }
    }

    // Método: `&self` es una referencia a la propia instancia.
    fn presentarse(&self) -> String {
        format!("Soy {} y tengo {} años", self.nombre, self.edad)
    }

    fn es_mayor_de_edad(&self) -> bool {
        self.edad >= 18
    }
}

fn leccion_07_structs() {
    println!("--- Lección 7: Structs ---");

    let ana = Persona::new("Ana", 25);
    println!("{}", ana.presentarse());
    println!("¿Mayor de edad? {}\n", ana.es_mayor_de_edad());
}

// -------------------------------------------------------------
// LECCIÓN 8: Enums y Option (ausencia de valor sin `null`)
// -------------------------------------------------------------
// Un `enum` define un tipo que puede ser uno de varios casos.
// Rust NO tiene `null`; usa el enum `Option<T>` que es:
//   - Some(valor)  → hay un valor
//   - None         → no hay valor
// Esto elimina el clásico error de "null pointer".
enum Semaforo {
    Rojo,
    Amarillo,
    Verde,
}

fn accion_semaforo(luz: &Semaforo) -> &str {
    match luz {
        Semaforo::Rojo => "Frená",
        Semaforo::Amarillo => "Precaución",
        Semaforo::Verde => "Avanzá",
    }
}

fn leccion_08_enums_y_option() {
    println!("--- Lección 8: Enums y Option ---");

    // Recorremos los tres estados posibles del semáforo.
    let estados = [Semaforo::Rojo, Semaforo::Amarillo, Semaforo::Verde];
    for luz in &estados {
        println!("Semáforo: {}", accion_semaforo(luz));
    }

    // Buscar un elemento puede devolver Some(...) o None.
    let numeros = [10, 20, 30];
    let encontrado: Option<&i32> = numeros.iter().find(|&&x| x == 20);
    match encontrado {
        Some(valor) => println!("Encontré el {valor}"),
        None => println!("No estaba en la lista"),
    }
    println!();
}

// -------------------------------------------------------------
// LECCIÓN 9: Colecciones (Vec y iteradores)
// -------------------------------------------------------------
// `Vec<T>` es una lista que puede crecer. Los iteradores
// (`map`, `filter`, `sum`...) permiten procesarla de forma elegante.
fn leccion_09_colecciones() {
    println!("--- Lección 9: Colecciones ---");

    let mut numeros: Vec<i32> = Vec::new();
    numeros.push(1);
    numeros.push(2);
    numeros.push(3);
    numeros.push(4);

    // Sumar todos los elementos.
    let total: i32 = numeros.iter().sum();
    println!("La lista es {:?} y suma {total}", numeros);

    // map + filter: quedarnos con los pares y duplicarlos.
    let pares_duplicados: Vec<i32> = numeros
        .iter()
        .filter(|&&x| x % 2 == 0) // solo pares
        .map(|&x| x * 2) // duplicar
        .collect(); // juntar en un nuevo Vec
    println!("Pares duplicados: {:?}\n", pares_duplicados);
}

// -------------------------------------------------------------
// LECCIÓN 10: Manejo de errores con Result
// -------------------------------------------------------------
// Rust no usa excepciones. Las operaciones que pueden fallar
// devuelven `Result<T, E>`:
//   - Ok(valor)   → salió bien
//   - Err(error)  → falló
// El compilador te obliga a manejar el error: no lo podés ignorar.
fn dividir(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("no se puede dividir por cero"))
    } else {
        Ok(a / b)
    }
}

fn leccion_10_manejo_de_errores() {
    println!("--- Lección 10: Manejo de errores ---");

    match dividir(10.0, 2.0) {
        Ok(r) => println!("10 / 2 = {r}"),
        Err(e) => println!("Error: {e}"),
    }

    match dividir(10.0, 0.0) {
        Ok(r) => println!("10 / 0 = {r}"),
        Err(e) => println!("Error: {e}"),
    }
    println!();
}

// -------------------------------------------------------------
// LECCIÓN 11: Ejercicio final (juntando todo)
// -------------------------------------------------------------
// FizzBuzz: el clásico ejercicio. Recorremos del 1 al 15:
//   - múltiplos de 3 y 5 → "FizzBuzz"
//   - múltiplos de 3     → "Fizz"
//   - múltiplos de 5     → "Buzz"
//   - el resto           → el número
//
// 👉 TU TURNO: cambiá el rango (1..=30), o agregá una regla nueva
//    (por ejemplo "Bazz" para múltiplos de 7) y volvé a correr `cargo run`.
fn leccion_11_ejercicio_final() {
    println!("--- Lección 11: Ejercicio (FizzBuzz) ---");

    for n in 1..=15 {
        let salida = match (n % 3, n % 5) {
            (0, 0) => "FizzBuzz".to_string(),
            (0, _) => "Fizz".to_string(),
            (_, 0) => "Buzz".to_string(),
            _ => n.to_string(),
        };
        print!("{salida} ");
    }
    println!();
}
