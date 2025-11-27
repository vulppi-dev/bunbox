mod core;

fn main() {
    match core::engine_init() {
        core::enums::EngineResult::Success => {}
        err => {
            panic!(
                "Engine initialization failed with error code: {}",
                err as u32
            );
        }
    };

    core::engine_dispose();
    // // Importante para usar outra API gráfica (wgpu) em vez de OpenGL
    // glfw.window_hint(WindowHint::ClientApi(ClientApiHint::NoApi));

    // // create_window(...) -> Option<(Window, Receiver<(f64, WindowEvent)>)>
    // // expect() pega o valor ou encerra com a mensagem passada.
    // let (mut window, events) = glfw
    //     .create_window(800, 600, "Engine Core", WindowMode::Windowed)
    //     .expect("Failed to create GLFW window");

    // // Pedir para receber eventos de teclado
    // window.set_key_polling(true);

    // // Game loop básico
    // while !window.should_close() {
    //     // Pede para a GLFW processar eventos do SO
    //     glfw.poll_events();

    //     // Lê os eventos acumulados
    //     for (_, event) in glfw::flush_messages(&events) {
    //         match event {
    //             WindowEvent::Key(Key::Escape, _, Action::Press, _) => {
    //                 window.set_should_close(true);
    //             }
    //             _ => {}
    //         }
    //     }

    //     // Aqui depois a gente vai chamar o render do wgpu
    // }
}
