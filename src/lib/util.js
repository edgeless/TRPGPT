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

     const prompt=`以下の文章からキャラクターの情報を抽出してください。キーは英単語とし、"name"と"parameter"は必ず含めてください。バッククォート等でのフォーマッティングはせずに、jsonとしてパースできる形式で、objectを一つだけ含むデータとして出力してください。\n\n###文章\n${target}\n###JSON\n{`

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
      let data = JSON.parse("{" + completion.data.choices[0].text)
      console.log(data)
      
     return data;

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

    const prompt=`以下の文章から、プレイヤーへのキャラクター作成指示や能力値・職業等の説明をを取り除いて、舞台設定を抽出してください。。
    ###入力
    ファンタジーTRPG「dragony」へようこそ。これはプレイヤーが協力し合ってドラゴンを倒すファンタジーRPGです。まず、プレイヤーキャラクターを作成してください。 1. キャラクターの種族を選んでください。種族によって能力値や特徴が異なります。 2. キャラクターの職業を選んでください。職業によってスキルや装備が異なります。 3. 能力値を振り分けてください。能力値は力、敏捷性、耐久力、知力、魅力の5つです。 4. 装備やアイテムを選んでください。ダンジョン内での生存に必要なものがあります。 5. パーティー内の役割を考えて、他のプレイヤーと協力して戦略を練ってください。。
    ###出力
    これはファンタジーTRPG「dragony」です。ドラゴンを倒すファンタジーRPGです。
    ###入力
    「chazardly」のGMとして、プレイヤーに以下の指示を出します。1. 能力値を振り分けてください。能力値は力、敏捷性、耐久力、知力、魅力の5つです。各能力値は1から10までの範囲で振り分けてください。合計値は25にしてください。2. キャラクターの種族を選んでください。種族によって能力値や特徴が異なります。種族は人間、エルフ、ドワーフ、ハーフリング、オーク、ゴブリン、トロール、ドラゴンボーン、ノーム、ハーフエルフの中から選んでください。3. キャラクターの職業を選んでください。職業によって能力値やスキルが異なります。職業は戦士、盗賊、魔法使い、僧侶、狩人、商人、農夫、漁師、職人、芸術家、学者、冒険家、宗教家、医者、スポーツ選手、政治家、軍人、警察官、消防士、教師、記者、エンジニア、IT技術者、料理人、アイドル、芸人、ホスト、ホステス、その他の中から選んでください。以上の指示を出して、プレイヤーがキャラクター作成を行えるようにしてください。
    ###出力
    これはTRPG「chazardly」です。
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
