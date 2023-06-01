import { Configuration, OpenAIApi } from "azure-openai"; 


export async function extractInfo(target) {
    const openAiApi = new OpenAIApi(
        new Configuration({
           apiKey: "",
           azure: {
              apiKey: "952368f04a9a41ae9adf6350337ab9a9",
              endpoint: "https://astringent.openai.azure.com/",
              deploymentName: "test-3",
           }
        }),
     );

     const prompt=`以下の文章からjsonのlist形式で情報抽出してください。キーは英単語としてください。\n\n${target}\n`

     const completion = await openAiApi.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        best_of: 1,
        stop: undefined
      });
      console.log(completion)
      
     return JSON.parse(completion.data.choices[0].text);

}


