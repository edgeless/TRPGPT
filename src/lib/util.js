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

export async function extract_setting(target) {
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

    const prompt=`以下の文章から舞台設定を抽出してください。プレイヤーへの指示は不要です。
    ###入力
    ファンタジーTRPG「dragony」へようこそ。これはプレイヤーが協力し合ってドラゴンを倒すファンタジーRPGです。まず、プレイヤーキャラクターを作成してください。 1. キャラクターの種族を選んでください。種族によって能力値や特徴が異なります。 2. キャラクターの職業を選んでください。職業によってスキルや装備が異なります。 3. 能力値を振り分けてください。能力値は力、敏捷性、耐久力、知力、魅力の5つです。 4. 装備やアイテムを選んでください。ダンジョン内での生存に必要なものがあります。 5. パーティー内の役割を考えて、他のプレイヤーと協力して戦略を練ってください。。
    ###出力
    これはファンタジーTRPG「dragony」です。ドラゴンを倒すファンタジーRPGです。
    ###入力
    シティアドベンチャーTRPG「HackCity」のGMとして、以下の通りキャラクターを作成してください。 1. キャラクターの種族を選んでください。種族によって能力値や特徴が異なります。 2. キャラクターの職業を選んでください。職業によってスキルや装備が異なります。 3. 能力値を振り分けてください。能力値は力、敏捷性、耐久力、知力、魅力の5つです。 4. 装備やアイテムを選んでください。ダンジョン内での生存に必要なものがあります。 5. パーティー内の役割を考えて、他のプレイヤーと協力して戦略を練ってください。 以降、プレイヤーは麻薬と暴力の街「Dombew」を舞台に、巨悪と戦ったり人助けをしたり謎を解いたりします。。
    ###出力
    これはシティアドベンチャーTRPG「HackCity」です。麻薬と暴力の街「Dombew」を舞台に様々な冒険をします。
    ###入力
    ${target}\n###出力\n`

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
     
    return completion.data.choices[0].text;

}
