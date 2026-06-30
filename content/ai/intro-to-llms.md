---
title: "大语言模型（LLM）入门指南"
description: "从零理解大语言模型的工作原理，包括 Transformer 架构、Prompt Engineering 与实际应用技巧"
date: "2025-04-05"
category: "ai"
tags: ["llm", "ai", "prompt-engineering", "transformer"]
featured: true
---

## 什么是大语言模型

大语言模型（Large Language Model，LLM）是基于深度学习技术、在海量文本数据上训练的神经网络模型。它能够理解和生成接近人类水平的自然语言。

代表性模型：
- **GPT 系列**（OpenAI）：GPT-3、GPT-4、ChatGPT
- **Claude 系列**（Anthropic）：Claude 3、Claude 3.5
- **Gemini 系列**（Google）：Gemini 1.5 Pro
- **Llama 系列**（Meta）：Llama 3（开源）

## Transformer 架构简介

现代 LLM 的核心是 **Transformer** 架构（Vaswani et al., 2017）：

```
输入文本 → Tokenization → Embedding
    ↓
多头自注意力机制 (Multi-Head Self-Attention)
    ↓
前馈神经网络 (Feed-Forward Network)
    ↓
重复 N 层
    ↓
输出概率分布 → 生成下一个 Token
```

### 关键概念：Token

模型并不直接处理字符，而是将文本切分为 **Token**（词元）：

```
"Hello, World!" → ["Hello", ",", " World", "!"]
# 中文通常每个汉字是一个 token
"你好世界" → ["你", "好", "世", "界"]
```

### 注意力机制

自注意力让模型理解词与词之间的关系：

```python
# 简化的注意力计算（概念示意）
import torch
import torch.nn.functional as F

def attention(Q, K, V, d_k):
    # Q: Query, K: Key, V: Value
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    attn_weights = F.softmax(scores, dim=-1)
    return torch.matmul(attn_weights, V)
```

## Prompt Engineering 技巧

Prompt 质量直接决定输出质量。

### 基本原则

1. **清晰具体**：明确说明你想要什么
2. **提供上下文**：给出背景信息
3. **指定格式**：要求特定的输出格式
4. **给出示例**：Few-shot prompting

```
# ❌ 模糊的 Prompt
"写一篇关于 TypeScript 的文章"

# ✅ 清晰的 Prompt
"请写一篇面向有 JavaScript 基础的开发者的 TypeScript 入门教程。
要求：
- 长度 800-1000 字
- 包含代码示例
- 重点介绍类型系统和接口
- 使用 Markdown 格式"
```

### Chain of Thought（思维链）

让模型逐步推理：

```
# 数学问题
Q: 一个农场有 3 只鸡，每只鸡每天下 2 个蛋，一周能下多少蛋？

# 普通 Prompt
A: 42

# Chain of Thought Prompt
"请逐步解题：
1. 每只鸡每天下多少蛋？
2. 3 只鸡每天共下多少蛋？
3. 一周 7 天共下多少蛋？"

A: 
1. 每只鸡每天下 2 个蛋
2. 3 只鸡每天共下 3 × 2 = 6 个蛋
3. 一周共下 6 × 7 = 42 个蛋
```

### 系统提示（System Prompt）

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system="你是一位专业的 Python 代码审查专家。请用中文回答，重点关注代码安全性和性能。",
    messages=[
        {"role": "user", "content": "请审查以下代码..."}
    ]
)
```

## RAG（检索增强生成）

RAG 是目前最实用的 LLM 应用模式之一：

```
用户问题
    ↓
向量化（Embedding）
    ↓
在知识库中检索相关文档
    ↓
将文档 + 问题一起发送给 LLM
    ↓
LLM 基于文档生成答案
```

```python
# 简单的 RAG 示意
from typing import List

def rag_query(question: str, documents: List[str]) -> str:
    # 1. 检索相关文档（简化版，实际用向量数据库）
    relevant_docs = retrieve_similar(question, documents)

    # 2. 构建 Prompt
    context = "\n\n".join(relevant_docs)
    prompt = f"""基于以下参考资料回答问题：

参考资料：
{context}

问题：{question}

请基于参考资料给出准确答案，如果资料中没有相关信息，请说明。"""

    # 3. 调用 LLM
    return call_llm(prompt)
```

## 模型选择建议

| 场景 | 推荐 | 理由 |
|------|------|------|
| 代码生成 | Claude Sonnet / GPT-4 | 编程能力强 |
| 长文档处理 | Claude（200K context） | 超长上下文 |
| 成本敏感 | Haiku / GPT-3.5 | 性价比高 |
| 本地部署 | Llama 3 / Qwen | 开源免费 |
| 中文内容 | Qwen / Claude | 中文表现好 |

## 注意事项

1. **幻觉问题**：LLM 可能生成看似合理但实际错误的内容，重要信息需要验证
2. **上下文限制**：每次对话都有 token 限制，长文档需要分块处理
3. **成本控制**：API 调用按 token 计费，优化 Prompt 可降低成本
4. **隐私安全**：不要将敏感信息发送给第三方 API
