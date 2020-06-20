import {Status, ThankYou} from '../types';
import {getIdByEmailPrefix, postMessage} from '../slack';
import {getApprovedMessages, updateMessage} from '../service';
import {trackNewThankDelivered} from '../statistics/statistics';

export const deliverPastThanks = async () => {
  const messages = await getApprovedMessages();
  for (let message of messages) {
    if (message.id) {
      await _deliverThank(message);
      await updateMessage(message.id, {
        ...message,
        status: Status.DELIVERED
      });
      await trackNewThankDelivered(message.recipient.username);
    }
  }
  return messages.length;
};

const _deliverThank = async (thankYou: ThankYou) => {
  const author = await getIdByEmailPrefix(thankYou.author.username);
  const text = `_📣 <@${author}> souhaite te dire merci :_`;
  return await postMessage(
    await getIdByEmailPrefix(thankYou.recipient.username),
    text,
    [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `>${thankYou.text.replace(/\n/g, '\n>')}`,
        },
      }
    ]
  );
};
