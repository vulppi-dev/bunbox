## Documentação

Garantir que a implementação está correta observe as documentações nos site abaixo:

- Bun => https://bun.com/docs, https://bun.com/reference
- GLFW => https://glfw.org/docs/latest/topics.html
- Vulkan => https://www.khronos.org/registry/vulkan/specs/1.3-extensions/html/vkspec.html

## Linguagem e padrões

A linguagem utilizada será typescript em sua maioria, apenas que especificamente for pedido, fará em outra linguagem.
A linguagem, e os comentários criados nela, devem ser escritos em inglês.
A conversação com o usuário e explicações serão em português brasil.
Use bons nomes de variáveis para não ser necessário o uso de comentários.

### Padrões de código

#### Variáveis

- Constantes globais devem ser escritas UPPER_CASE;
- Variáveis diversas devem ser escritas em camelCase;

### Classes

- Variáveis e métodos do tipo `protected` devem ser iniciadas com '\_';
- Variáveis e métodos do tipo `private` devem ser iniciadas com '#';
- Métodos estáticos devem ser criados antes do construtor;

### Gerenciamento de Recursos

- **Todas as classes que gerenciam recursos Vulkan/GLFW devem implementar `Disposable`** do `@bunbox/utils`;
- **Evitar Factory Pattern**: Use métodos `prepare()` ou `rebuild()` para construção/reconstrução de recursos;
- **Liberação de recursos antes de reconstruir**: Use métodos `release()` para liberar recursos internos sem destruir a instância;
- **Nomenclatura**:
  - `prepare()`: Inicializar/preparar recursos pela primeira vez
  - `rebuild()`: Reconstruir recursos existentes (chama `release()` internamente se necessário)
  - `release()`: Liberar recursos internos sem destruir a instância
  - `dispose()`: Destruição final completa (da interface `Disposable`)
