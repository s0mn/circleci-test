import { get } from 'lodash';

export default function (data) {
  if (!data.coreUrl) throw new Error('No coreUrl in query');

  return Object.assign(data, {
    reactor: {
      coreUrl: data.coreUrl,
    },
  });
};

