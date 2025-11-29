# 🦊 Vulfram — Decisões Técnicas

Game Engine Experimental • Rust • WGPU • Bun FFI

---

## 1. Visão Geral Técnica

- Engine minimalista, multiplataforma.
- Escrita em **Rust**.
- Integrada a runtimes JavaScript (principalmente **Bun**) via **FFI** e dynamic libraries.
- Foco em:
  - arquitetura binária simples;
  - comunicação estruturada via **CBOR**;
  - uso de **buffers crus** (fontes, imagens, áudio, etc.);
  - **frame loop controlado externamente** pelo host;
  - performance com **WGPU**;
  - design acessível e multiplataforma.

---

## 2. Tecnologias Principais

- **Linguagem:** Rust
- **Janela:** Winit v0.30.12
- **Gráficos:** WGPU v27
- **FFI / Host:** N-API / Bun FFI
- **Serialização estruturada:** `serde_cbor` (CBOR padronizado)
- **Deploy:**
  - Engine como **dynamic library**
  - Host Bun gera um **single executable** que embute a engine

---

## 3. Comunicação Engine ↔ Host

### 3.1 Pools (CBOR, até 128 kB)

Uso de **dois pools** para tráfego de mensagens em formato **CBOR**:

- `engine_send_pool`
  - Direção: Host → Engine
  - Conteúdo: comandos (ex.: `create_buffer`, `set_pipeline`, `resize`)

- `engine_receive_pool`
  - Direção: Engine → Host
  - Conteúdo: eventos (ex.: `key_down`, `window_resize`, `log`, `ready`)

Regras:

- Mensagens tipadas em Rust (structs/enums)
- Serialização/deserialização via `serde_cbor`
- Tamanho máximo por batch: **até 128 kB**

---

### 3.2 Buffers Crus (Binário Puro)

Buffers são tratados como **payload binário cru**, sem pré-processamento:

- **Imagens:** PNG, AVIF, WebP
- **Fontes:** TTF, OTF
- **Áudio:** MP3, OGG, WAV, FLAC
- **Outros:** qualquer payload binário arbitrário

Manipulação via funções dedicadas:

- `engine_upload_buffer`
- `engine_download_buffer`

Os **metadados** desses buffers (ex.: tipo, tamanho, uso) são enviados via CBOR no `engine_send_pool`.

---

## 4. API Binária Exposta

A engine expõe **7 funções principais** para o host:

```txt
engine_init
engine_terminate
engine_send_pool
engine_receive_pool
engine_upload_buffer
engine_download_buffer
engine_clear_buffer
engine_call_tick
```

Regras gerais:

- Todas retornam `u32`
  - `0` = sucesso
  - `!= 0` = códigos de erro padronizados

- `buffer_id` é `u64` para garantir:
  - espaço amplo de identificação;
  - estabilidade entre sessões, se desejado.

- Não há exceções em FFI; erros são sempre convertidos em códigos numéricos.

---

## 5. Gestão Interna da Engine

A engine mantém registries internos para:

- **Buffers** (por `u64`)
- **Texturas**
- **Fontes**
- **Pipelines**
- **Eventos / estados de janela**

O **frame loop** é controlado **externamente** pelo host, que chama:

- `engine_call_tick(time, delta_time)`

Em cada chamada de `tick`, a engine:

1. Lê comandos do `engine_send_pool`.
2. Atualiza estados internos / executa operações gráficas.
3. Produz eventos/respostas no `engine_receive_pool`.
4. Gerencia buffers conforme necessário.

---

## 6. Decisões Pendentes / Futuras

Itens marcados como pendentes para versões futuras:

- **Gerenciador de fontes**
  - Provável rasterização interna;
  - Cache de glyphs e atlas de fonte.

- **Gerenciador de áudio**
  - Mixagem, streaming, efeitos;
  - Integração com backend de áudio multiplataforma.

- **Pipelines personalizados**
  - Suporte a pipelines gráficos configuráveis;
  - Shaders customizados.

- **Ferramentas auxiliares**
  - CLI tooling (build/pack de assets, diagnose);
  - Editor/inspector;
  - Debugger visual.
