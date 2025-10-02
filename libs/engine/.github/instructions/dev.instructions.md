---
applyTo: '**/*.ts'
---

## Documentação

Garantir que a implementação está correta observe as documentações nos site abaixo:

- SDL => https://wiki.libsdl.org/SDL3
- Bun => https://bun.com/docs, https://bun.com/reference

## Linguagem e padrões

A linguagem utilizada será typescript em sua maioria, apenas que especificamente for pedido, fará em outra linguagem.
A linguagem, e os comentários criados nela, devem ser escritos em inglês.
A conversação com o usuário e explicações serão em português brasil.

### Padrões de código

#### Variáveis

- Constantes globais devem ser escritas UPPER_CASE;
- Variáveis diversas devem ser escritas em camelCase;

### Classes

- Variáveis e métodos do tipo `protected` devem ser iniciadas com '\_';
- Variáveis e métodos do tipo `private` devem ser iniciadas com '#';
- Métodos estáticos devem ser criados antes do construtor;
- Não deve possuir variáveis públicas, apenas getters e setters;

#### Ordenação de membros

1. Variáveis estáticas e privadas;
2. Métodos estáticos;
3. Construtor;
4. Getters e setters;
5. Métodos públicos;
6. Métodos protegidos;
7. Métodos privados;
8. Métodos abstratos;

## Regras do game engine

- A classe base de todas as classes do motor é a `Node`;
- O padrão de orientação é o right-handed com NDC (Normalized Device Coordinates) de [0, 1] no eixo Z;
- O padrão de rotação é o ZYX (Yaw, Pitch, Roll);
- A unidade de medida padrão é o metro (m);
- O sistema de matriz utilizado é o de coluna maior (column-major);
