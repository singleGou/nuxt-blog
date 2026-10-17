export const sources = {
  executive: { label: 'NIMH · The Teen Brain', url: 'https://www.nimh.nih.gov/health/publications/the-teen-brain-7-things-to-know' },
  memory: { label: 'BrainFacts · Different Facets of Memory', url: 'https://www.brainfacts.org/thinking-sensing-and-behaving/learning-and-memory/2012/different-facets-of-memory' },
  basics: { label: 'NIMH · Get to Know Your Brain', url: 'https://www.nimh.nih.gov/news/media/2023/get-to-know-your-brain' },
}
export const regions = [
  { id: 'prefrontal', name: '前额叶皮层', en: 'Prefrontal cortex', color: '#eb947c', tag: '计划 · 工作记忆', location: '额叶的前部，大致位于额头后方。', description: '参与计划、决策和工作记忆，帮助我们围绕目标组织行为。它包含多个功能不同的区域，也需要与其他脑区协作。', example: '心算找零时，你需要暂时保留数字，并按照目标更新它们。', source: sources.memory },
  { id: 'parietal', name: '顶叶', en: 'Parietal lobe', color: '#d9b986', tag: '感觉 · 空间', location: '大脑上部，额叶后方。', description: '参与整合身体感觉和空间信息；不同区域还参与注意、语言等过程。', example: '伸手拿桌上的杯子，需要结合你看到的位置与手的位置。', source: sources.basics },
  { id: 'temporal', name: '颞叶', en: 'Temporal lobe', color: '#b9a3cf', tag: '听觉 · 理解', location: '大脑两侧，大致位于耳朵上方。', description: '参与听觉和声音理解。颞叶内侧的结构也参与记忆，不同任务依赖不同网络。', example: '听到朋友叫你的名字时，声音需要被处理并赋予意义。', source: sources.basics },
  { id: 'occipital', name: '枕叶', en: 'Occipital lobe', color: '#8fbba9', tag: '视觉信息', location: '大脑后部。', description: '参与处理视觉信息，并与其他区域共同支持对物体、面孔和空间的识别。', example: '阅读眼前的文字，需要视觉处理与语言网络共同参与。', source: sources.basics },
  { id: 'hippocampus', name: '海马', en: 'Hippocampus', color: '#e4be62', tag: '经历 · 记忆', location: '颞叶内侧深处，左右各有一个。', description: '与大脑皮层网络共同支持事件和事实记忆。它并不是储存所有记忆的独立仓库。', example: '回想昨天在哪里吃午饭，需要将地点与经历联系起来。', source: sources.memory },
  { id: 'cerebellum', name: '小脑', en: 'Cerebellum', color: '#88b4c9', tag: '平衡 · 协调', location: '大脑后下方。', description: '参与平衡与动作协调。这里突出它在运动中的作用，并不穷尽其全部功能。', example: '骑自行车保持平衡，需要多个感觉与运动系统不断协调。', source: sources.basics },
] as const
export type RegionId = typeof regions[number]['id']
export const stories = [
  { title: '刚看过，为什么就忘了？', eyebrow: '01 / 学习与记忆', subtitle: '从注意，到形成记忆，再到提取。', steps: [
    { region: 'prefrontal', title: '先让信息留在眼前', text: '阅读时，我们会暂时保持并处理信息。工作记忆涉及前额叶及其他皮层区域；看到文字，并不等于已经形成持久记忆。' },
    { region: 'hippocampus', title: '把信息连成一段经历', text: '海马与皮层网络协作，支持事实和事件记忆。透视可以帮助你找到它的大致位置；模型并未展示实际神经信号或完整通路。' },
    { region: 'temporal', title: '记忆需要网络一起工作', text: '记忆的不同内容依赖分布式网络。你可以用合上页面后复述的方式，观察自己能提取出什么；这个互动不评估记忆能力。' },
  ] },
  { title: '心算时，数字放在哪里？', eyebrow: '02 / 日常注意', subtitle: '认识短暂保持和处理信息的过程。', steps: [
    { region: 'occipital', title: '看见题目', text: '先从视觉信息开始。枕叶参与视觉处理，但理解一道题还需要其他区域参与。' },
    { region: 'prefrontal', title: '保持，并更新', text: '心算 27 + 16 时，你会保持数字并更新中间结果。这是理解工作记忆的一种生活场景，不是单个区域独立完成的任务。' },
    { region: 'parietal', title: '把视角放回网络', text: '注意、感觉与目标会共同影响任务。图中的区域是探索入口，不代表一项能力只属于一个位置。' },
  ] },
  { title: '骑车时，身体如何配合？', eyebrow: '03 / 身体与动作', subtitle: '看见感觉、空间与协调的联系。', steps: [
    { region: 'occipital', title: '观察周围', text: '视觉处理帮助我们获取道路和周围物体的信息；真实骑行还会结合听觉、身体感觉等输入。' },
    { region: 'parietal', title: '感知身体与空间', text: '顶叶参与身体感觉和空间信息的整合，帮助我们理解身体与环境的关系。' },
    { region: 'cerebellum', title: '不断协调动作', text: '小脑参与平衡和协调。骑行是多个系统共同参与的过程，这个导览只展示其中几个入口。' },
  ] },
] as const
