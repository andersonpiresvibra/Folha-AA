# Suporte Folha American - Documentação do Sistema JETFUEL-SIM

Este documento descreve o funcionamento técnico, as fórmulas e a lógica de negócio implementada no aplicativo de gestão de combustível de aviação.

## 1. Visão Geral
O aplicativo foi desenvolvido para automatizar o preenchimento da **Folha de Rascunho da American Airlines**, garantindo precisão nos cálculos de abastecimento e conformidade com as normas de tolerância de segurança.

## 2. Processo de Cálculo (Passo a Passo)

### Passo 1: Totalização das Colunas (LBS)
O sistema soma as leituras individuais dos tanques (Left, Center, Right) para obter:
- **Total A (Before Fueling):** Remanescente antes do abastecimento.
- **Total B (After Fueling):** Quantidade total após o abastecimento.
- **Total Required (Gate Release):** Quantidade solicitada para o voo.

### Passo 2: Peso Adicionado (Campo C)
Calcula a diferença em libras entre o estado final e inicial:
`C = Total B - Total A`

### Passo 3: Conversão para Volume (Campo D)
Converte o peso adicionado (LBS) para galões (GALLONS) usando a densidade atual:
`D = C / Densidade`
*Regra de Arredondamento:* O valor é arredondado para o inteiro mais próximo (0.5 para cima, 0.4 para baixo).

### Passo 4: Volume do Equipamento (Campo E)
Soma os galões registrados nos medidores dos caminhões (Meters/CE's).

### Passo 5: Diferença Real (Campo F)
Calcula a discrepância entre o que o avião registrou e o que o caminhão entregou:
`F = D - E`
*Convenção:* Se o caminhão entregou mais que o avião (`Truck > Plane`), o valor é negativo e exibido entre parênteses `(XXX)`.

### Passo 6: Validação de Tolerância (Campo G)
A tolerância máxima permitida é de **750 galões**.
- Se `|F| <= 750`: A folha está aprovada.
- Se `|F| > 750`: O sistema exibe um alerta de "Diferença Excedida".

---

## 3. Guia Rápido de Recálculo (Sugerir Nova Folha)

Quando a tolerância é excedida, o sistema oferece a função **"Sugerir Nova Folha"**. Esta função aplica uma lógica matemática reversa para ajustar o **Remanescente (Before Fueling)**, mantendo o **After Fueling** (que é um dado físico inalterável após o voo) como base.

### Lógica de Ajuste Estratégico:
O objetivo é trazer o erro para o limite exato de **750 galões** (ou ligeiramente menos, devido ao arredondamento de segurança).

1. **Cálculo do Alvo:**
   - Se `Plane > Truck`: O sistema calcula o `Before Fueling` necessário para que o erro seja exatamente `+750`.
   - Se `Truck > Plane`: O sistema calcula o `Before Fueling` necessário para que o erro seja exatamente `-750`.

2. **Arredondamento de Segurança (Anti-Excedente):**
   - Para garantir que o erro nunca ultrapasse 750 (como 751 ou 759), o sistema aplica um arredondamento direcional:
     - Se o erro era positivo, arredonda o remanescente para **CIMA** (múltiplo de 100).
     - Se o erro era negativo, arredonda o remanescente para **BAIXO** (múltiplo de 100).

3. **Redistribuição:**
   O novo `Total A` é distribuído igualmente entre as asas (Left/Right), mantendo o tanque central (Center) zerado, conforme padrão operacional.

---

## 4. Regras de Arredondamento
- **Galões:** Sempre inteiros.
- **Libras:** Múltiplos de 100 (no caso de sugestões de remanescente).
- **Densidade:** Utiliza o valor informado (ex: 6.64).

## 5. Conclusão
A solução está **resolvida com sucesso**, integrando as fórmulas físicas da aviação com uma interface de alta fidelidade que previne erros humanos e agiliza a aprovação de voos.
