from langchain_openai import ChatOpenAI
from langchain.agents import tool, AgentExecutor, create_openai_tools_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage

#依赖：langchain，langchain_openai

@tool
def is_professional(data):
    """
    输入用户数据进行专业度预测
    用户数据例子:{'eth_balance': 1.6,'total_txs': 630,'sent_txs': 350,'received_txs': 280,'sent_to_contract_txs': 220,'received_from_contract_txs': 180,'external_txs' : 150,'internal_txs' : 100}
    """
    import pre
    try:
        return f'专业度：{pre.predict_professional(data)}'
    except:
        return f'预测失败！检查数据格式是否正确！'
#目前有死循环bug，但不报错就没问题



#为了安全考虑这里一般采用环境变量

llm = ChatOpenAI(
    model='ep-20250412204128-bhvmc',
    api_key='e4324917-1d07-45b5-b157-f730db66b1c3',
    temperature=0.5,
    max_tokens=None,
    base_url='https://ark.cn-beijing.volces.com/api/v3'
)

#可适当调低温度

prompt = ChatPromptTemplate.from_messages([
    SystemMessage(content="你是defiAi领域专业信用评估师，对于评估流程，你会先使用你的工具去分析该用户是否为专业用户，在使用工具时，请严格输入如下方例子的数据，否则你的调用将会失败，例子:{'eth_balance': 1.6,'total_txs': 630,'sent_txs': 350,'received_txs': 280,'sent_to_contract_txs': 220,'received_from_contract_txs': 180,'external_txs' : 150,'internal_txs' : 100}；你将会得到一个专业度，专业度越高，代表该用户越有可能是专业用户，然后再根据用户基本情况给出你的信用评分(范围100-800)，只需要输出分数，如：150；不要做过多输出！"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

tools = [is_professional]



agent = create_openai_tools_agent(llm, tools, prompt)


agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
    handle_parsing_errors=True
)

#data这里格式见上方工具的用户例子，一定是对应格式，不然会报错！(这里没定义，你看怎么写)

response = (agent_executor.invoke({"input": f"用户数据:{data}请进行信用分判断，只需输出分数，不要做过多输出！不要做过多输出！不要做过多输出！"}))
score = response['output']


#score就是输出分数
