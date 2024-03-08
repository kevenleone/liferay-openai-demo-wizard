import axios from 'axios';
import fs from 'fs';
import http from 'https';
import OpenAI from 'openai';
import request from 'request';

import functions from '../../utils/functions';
import { logger } from '../../utils/logger';

const debug = logger('NewsAction');

export default async function NewsAction(req, res) {
  let start = new Date().getTime();
  let successes = 0;

  const openai = new OpenAI({
    apiKey: req.body.config.openAIKey,
  });

  const runCount = req.body.newsNumber;
  const imageGeneration = req.body.imageGeneration;

  debug('requesting ' + runCount + ' new(s) articles');
  debug('include images: ' + imageGeneration);

  const runCountMax = 10;

  let newsJson, response;
  const newsContentSet = [];

  const storedProperties = {
    alternativeHeadline: {
      description: 'A headline that is a summary of the news article',
      type: 'string',
    },
    articleBody: {
      description:
        'The content of the news article which should be ' +
        req.body.newsLength +
        ' words or more.  Remove any double quotes',
      type: 'string',
    },
    headline: {
      description: 'The title of the news artcile',
      type: 'string',
    },
    picture_description: {
      description:
        'A description of an appropriate image for this news in three sentences.',
      type: 'string',
    },
  };

  let requiredFields = [
    'headline',
    'alternativeHeadline',
    'articleBody',
    'picture_description',
  ];
  let languages = req.body.languages;

  if (req.body.manageLanguage) {
    for (let i = 0; i < languages.length; i++) {
      storedProperties['headline_' + languages[i]] = {
        description:
          'The title of the news artcile translated into ' +
          functions.getLanguageDisplayName(languages[i]),
        type: 'string',
      };
      requiredFields.push('headline_' + languages[i]);

      storedProperties['alternativeHeadline_' + languages[i]] = {
        description:
          'A headline that is a summary of the news article translated into ' +
          functions.getLanguageDisplayName(languages[i]),
        type: 'string',
      };
      requiredFields.push('alternativeHeadline_' + languages[i]);

      storedProperties['articleBody_' + languages[i]] = {
        description:
          'The content of the news article translated into ' +
          functions.getLanguageDisplayName(languages[i]),
        type: 'string',
      };
      requiredFields.push('articleBody_' + languages[i]);
    }
  }

  const newsSchema = {
    properties: storedProperties,
    required: requiredFields,
    type: 'object',
  };

  for (let i = 0; i < runCount; i++) {
    response = await openai.chat.completions.create({
      frequency_penalty: 0.5,
      function_call: { name: 'get_news_content' },
      functions: [{ name: 'get_news_content', parameters: newsSchema }],
      messages: [
        { content: 'You are a news author.', role: 'system' },
        {
          content:
            'Write news on the subject of: ' +
            req.body.newsTopic +
            '. Each news title needs to be unique. The content of the news article which should be ' +
            req.body.newsLength +
            ' words or more.',
          role: 'user',
        },
      ],
      model: req.body.config.model,
      temperature: 0.8,
    });

    try {
      if (debug)
        console.log(response.choices[0].message.function_call.arguments);
      newsJson = JSON.parse(
        response.choices[0].message.function_call.arguments
      );
    } catch (parseException) {
      console.log('-----------------------------------------------------');
      console.log(
        '********Parse Exception on News Article ' + (i + 1) + '********'
      );
      console.log('-----------------------------------------------------');
      console.log(response);
      console.log(response.choices.length);
      console.log(response.choices[0].message);
      console.log('-----------------------------------------------------');
      console.log('------------------------END--------------------------');
      console.log('-----------------------------------------------------');
      continue;
    }

    let pictureDescription = newsJson.picture_description;
    delete newsJson.picture_description;

    if (req.body.imageStyle) {
      pictureDescription =
        'Create an image in the style of ' +
        req.body.imageStyle +
        '. ' +
        pictureDescription;
    }

    newsJson.articleBody = newsJson.articleBody.replace(
      /(?:\r\n|\r|\n)/g,
      '<br>'
    );

    debug('pictureDescription: ' + pictureDescription);

    try {
      if (imageGeneration != 'none') {
        const imageResponse = await openai.images.generate({
          model: imageGeneration,
          n: 1,
          prompt: pictureDescription,
          size: '1024x1024',
        });

        debug(imageResponse.data[0].url);

        const timestamp = new Date().getTime();
        const file = fs.createWriteStream(
          'generatedimages/img' + timestamp + '-' + i + '.jpg'
        );

        console.log('In Exports, getGeneratedImage:' + imageResponse);

        http.get(imageResponse.data[0].url, function (response) {
          response.pipe(file);

          file.on('finish', () => {
            file.close();
            postImageToLiferay(file, req, newsJson);
          });
        });
      } else {
        postNewsToLiferay(req, newsJson, null);
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.status);
      } else {
        console.log(error.message);
      }
    }

    newsContentSet.push(newsJson);
    successes++;

    if (i >= runCountMax) break;
  }

  let end = new Date().getTime();

  res.status(200).json({
    result:
      'Imported ' +
      successes +
      ' of ' +
      runCount +
      ' News Articles. ' +
      'Completed in ' +
      functions.millisToMinutesAndSeconds(end - start),
  });
}

function postImageToLiferay(file, req, newsJson) {
  const imageFolderId = parseInt(req.body.imageFolderId);

  let newsImageApiPath =
    req.body.config.serverURL +
    '/o/headless-delivery/v1.0/sites/' +
    req.body.siteId +
    '/documents';

  if (imageFolderId) {
    newsImageApiPath =
      req.body.config.serverURL +
      '/o/headless-delivery/v1.0/document-folders/' +
      imageFolderId +
      '/documents';
  }

  debug(newsImageApiPath);

  let fileStream = fs.createReadStream(process.cwd() + '/' + file.path);
  const options = functions.getFilePostOptions(
    newsImageApiPath,
    fileStream,
    'file',
    req.body.config.base64data
  );

  setTimeout(function () {
    request(options, function (err, res, body) {
      if (err) console.log(err);

      postNewsToLiferay(req, newsJson, JSON.parse(body).id);
    });
  }, 100);
}

async function postNewsToLiferay(req, newsJson, imageId) {
  let newsFields;

  newsFields = [
    {
      contentFieldValue: {
        data: newsJson.alternativeHeadline,
      },
      name: 'Headline',
    },
    {
      contentFieldValue: {
        data: newsJson.articleBody,
      },
      name: 'Content',
    },
    {
      contentFieldValue: {
        data: '',
      },
      name: 'Image',
    },
  ];

  if (imageId) {
    newsFields[2]['contentFieldValue']['image'] = {
      id: imageId,
    };
  }

  let titleValues = {};

  if (req.body.manageLanguage) {
    let alternativeHeadlineFieldValues = {};
    let articleBodyFieldValues = {};
    let imageValues = {};

    for (let l = 0; l < req.body.languages.length; l++) {
      if (imageId) {
        imageValues[req.body.languages[l]] = {
          data: '',
          image: {
            id: imageId,
          },
        };
      } else {
        imageValues[req.body.languages[l]] = {
          data: '',
        };
      }

      alternativeHeadlineFieldValues = {};
      articleBodyFieldValues = {};
      titleValues = {};

      for (const [key, value] of Object.entries(newsJson)) {
        try {
          if (key.indexOf('_') > 0) {
            let keySplit = key.split('_');

            if (keySplit[0] == 'headline') titleValues[keySplit[1]] = value;

            if (keySplit[0] == 'alternativeHeadline')
              alternativeHeadlineFieldValues[keySplit[1]] = { data: value };

            if (keySplit[0] == 'articleBody')
              articleBodyFieldValues[keySplit[1]] = { data: value };
          }
        } catch (error) {
          console.log(
            'unable to process translation for faq ' +
              l +
              ' : ' +
              req.body.languages[l]
          );
          debug(error);
        }
      }
    }

    newsFields[0]['contentFieldValue_i18n'] = alternativeHeadlineFieldValues;
    newsFields[1]['contentFieldValue_i18n'] = articleBodyFieldValues;
    newsFields[2]['contentFieldValue_i18n'] = imageValues;
  }

  const newsSchema = {
    contentFields: newsFields,
    contentStructureId: req.body.structureId,
    structuredContentFolderId: req.body.folderId,
    taxonomyCategoryIds: functions.returnArraySet(req.body.categoryIds),
    title: newsJson.headline,
    title_i18n: titleValues,
    viewableBy: req.body.viewOptions,
  };

  const apiPath =
    req.body.config.serverURL +
    '/o/headless-delivery/v1.0/sites/' +
    req.body.siteId +
    '/structured-contents';

  const options = functions.getAPIOptions('POST', req.body.defaultLanguage, req.body.config.base64data);

  await axios.post(apiPath, JSON.stringify(newsSchema), options);

  debug('News import process complete.');
}
