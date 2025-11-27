# # 🦊 **Vulfram — Design Document v1.0**

Game Engine Experimental • Rust • WGPU • Bun FFI

---

# ## 1. Visão Geral

**Vulfram** é uma game engine minimalista, multiplataforma, escrita em Rust e projetada para ser integrada a runtimes JavaScript (principalmente Bun) usando FFI e dynamic libraries.
Seu foco principal é:

- arquitetura binária simples
- comunicação estruturada via CBOR
- buffers crus (fontes, imagens, áudio)
- frame loop controlado externamente
- performance com WGPU
- design acessível e multiplataforma

O nome **Vulfram** vem da fusão de:

- **Vul** (da marca Vulppi, originada de “Vulpix”, raposa)
- **Wolfram/Tungstênio** (metal pesado e forte → performance)
- **Frame** (motor gráfico)

---

# ## 2. Arquitetura Técnica

### ### Tecnologias principais

- **Linguagem:** Rust
- **Janela:** GLFW3 v0.60
- **Gráficos:** WGPU v27
- **FFI:** N-API / Bun FFI
- **Serialização:** `serde_cbor` (CBOR padronizado)
- **Deploy:** Engine como dynamic library + host Bun → single executable

---

# ## 3. Comunicação Engine ↔ Host

A comunicação segue duas regras:

## ### 3.1 Pools (CBOR, até 128 kB)

Os pools são **arrays tipados de metadados** contendo comandos ou eventos.

- `engine_send_pool`
  → Host envia comandos em CBOR (ex: create_buffer, set_pipeline, resize)

- `engine_receive_pool`
  → Engine devolve eventos CBOR (ex: key_down, window_resize, log, ready)

Sempre usando structs/enums tipados em Rust → serializados com `serde_cbor`.

---

## ### 3.2 Buffers crus (binário puro)

Buffers enviados ou recebidos são **dados crus**, sem nenhum pré-processamento:

**Imagens:** PNG, AVIF, WebP
**Fontes:** TTF, OTF
**Áudio:** MP3, OGG, WAV, FLAC
**Qualquer payload binário**

Manipulados via:

- `engine_upload_buffer`
- `engine_download_buffer`

Os metadados desses buffers são enviados via CBOR no send_pool.

---

# ## 4. API Exposta (7 funções principais)

Todas retornam **u32** →
`0 = sucesso`, outros valores = erros padronizados.

```
engine_init
engine_terminate
engine_send_pool
engine_receive_pool
engine_upload_buffer
engine_download_buffer
engine_call_loop
```

Sem exceções; erros convertidos para códigos.

---

# ## 5. Gestão Interna

- Engine mantém registries internos de:
  - buffers
  - texturas
  - fontes
  - pipelines
  - eventos

- O frame loop é controlado pelo host via:
  - `engine_call_loop()`

---

# ## 6. Decisões Pendentes / Futuras

- Gerenciador de fontes (provavelmente rasterização interna)
- Gerenciador de áudio
- Pipelines personalizados
- Tools paralelos (cli, editor, debugger)

---

# # 🎨 7. Identidade Visual da Marca Vulfram

Decidimos uma estética:

- **Dark scheme**
- **Cores quentes e vivas**
- **Paleta análoga púrpura → magenta → roxo**
- **Logo com raposa** (origem Vulppi)
- **Efeito glitch/frame** (remetendo à engine)
- **Estética moderna e tecnológica**

---

# ## 7.1 Paleta principal (análoga quente)

### **Cor Primária (Brand Color)**

`#A64DFF` — Roxo vibrante quente

### **Analógica 1**

`#FF4DDE` — Magenta fluorescente

### **Analógica 2**

`#6E4DFF` — Roxo profundo com leve azul

---

## ### Neutros para Dark Scheme

- Fundo escuro principal: `#12091A`
- Fundo alternativo: `#1A1025`
- Borda suave: `#CBA8FF`
- Texto claro: `#FFFFFF`
- Texto escuro (modo light): `#1A1A1A`

---

# ## 7.2 Tipografia

Todas disponíveis via **Fontsource**.

### **Fonte Principal da Marca**

**Nunito**

- Logo: Nunito 700
- UI: Nunito 400–500

### **Fonte Monoespaçada (debug/log)**

**JetBrains Mono**

- Interface técnica
- Leitura de buffers / hex dumps
- Dados estruturados

---

# ## 7.3 Diretrizes do Logo

- Raposa estilizada (conexão com Vulppi)
- Estética neon quente
- Glitch/scanline/pixel drift → referência a **frames**
- Deve funcionar até em 32×32px
- Formato: app icon quadrado com cantos arredondados
- Sem excesso de detalhes → clareza em low res

---

# ## 7.4 Última versão aprovada (conceito do ícone)

**Características do ícone aprovado:**

- Raposa estilizada com boa silhueta
- Glitch horizontal leve → sensação de mudança de frame
- Cores púrpura/magenta quentes
- Fundo quase preto
- Estilo neon suave, sem agressividade
- Adequado para ícone de app

_(A imagem não é reproduzida aqui por limitações do texto,
mas foi a última geração aprovada.)_

---

# ## 8. Nome Oficial

### **VULFRAM**

Motivações:

- Vulppi → Raposa → Identidade
- Wolfram/Tungstênio → força, tecnologia
- Frame → motor gráfico
- Nome forte, único e memorável
- Disponível como marca/lib
- Excelente sonoridade internacional

---

# ## 9. Sumário Final de Decisões

| Área          | Decisão                   |
| ------------- | ------------------------- |
| Nome          | **Vulfram**               |
| Linguagem     | Rust                      |
| Gráficos      | WGPU                      |
| Janela        | GLFW                      |
| Comunicação   | CBOR (serde_cbor)         |
| Buffers       | PNG/AVIF/WebP/MP3/OGG/etc |
| Host          | Bun (FFI)                 |
| Funções       | 7 funções binárias        |
| Paleta        | Roxo quente → magenta     |
| Estilo visual | Neon suave, dark scheme   |
| Tipografia    | Nunito + JetBrains Mono   |
| Logo          | Raposa + glitch/frame     |
