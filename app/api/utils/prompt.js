export function getCharacterInfoPrompt(characters) {
    const characterInfoPrompt = `关于这些人名[${characters.map(char => char.name).join(',')}]，你需要返回他们的简介和身上的一些著名桥段和著名的梗。
    返回严格用json格式，具体为"｛ "name":"xxx","description":"xxxxx","story":［"xxx","xxx","xxx",....］｝"。
    如果你的知识库里没有这个人的信息，不要捏造，也不要虚构，直接固定返回给我"UNKOWN"`;
    return characterInfoPrompt;
}

export function getChatGenerationPrompt(characterInfos,rounds) {
    const chatGenerationPrompt = `接下来我会给你一些人的信息，你需要根据他们的信息，想象他们使用微信聊天时的对话内容。整体对话的氛围是幽默和调侃，用词通俗直白，但表达的内容又不失犀利。要求对话的轮数不少于 ${rounds} 轮。
    返回严格用json格式，返回示例:"[
{"name":"xxx","content":"xxxxxxxxxxxx"},
{"name":"xxx","content":"xxxxxxxxxxxx"},
........
]"
${characterInfos.map((char, index) => 
          `第${index + 1}个人的信息是：${JSON.stringify(char, null, 2)}`
        ).join('\n')
}
`;
    return chatGenerationPrompt;
}


