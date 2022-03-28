import { suite, test } from 'mocha';
import { expect } from 'chai';
import JSONPathQuery, { Operation } from '../JSONPathQuery';
import { simpleDocument, arrayDocument } from './fixture';

suite('TM Forum Examples - Fields', () => {
  test('Return channel name + root id and href', () => {
    const query: Operation[] = [
      {
        op: 'fields',
        path: 'channel.name',
      },
    ];
    const expected = {
      id: '3180',
      href: 'https://host:port/troubleTicket/v2/troubleTicket/3180',
      channel: {
        name: 'Self Service',
      },
    };
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Return channel name + root id and href, for all elements in collection', () => {
    const query: Operation[] = [
      {
        op: 'fields',
        path: '$[*].channel.name',
      },
    ];
    const expected = [{
      id: '3180',
      href: 'https://host:port/troubleTicket/v2/troubleTicket/3180',
      channel: {
        name: 'Self Service',
      },
    }, {
      id: '6000',
      href: 'https://host:port/troubleTicket/v2/troubleTicket/6000',
      channel: {
        name: 'Self Service',
      },
    }];
    const result = JSONPathQuery.query(arrayDocument, query);
    expect(result).to.eql(expected);
  });

  test('Return note where author=="Mr John Wils" + root id and href', () => {
    const query: Operation[] = [
      {
        op: 'fields',
        path: "note[?(@.author=='Mr John Wils')]",
      },
    ];
    const expected = {
      id: '3180',
      href: 'https://host:port/troubleTicket/v2/troubleTicket/3180',
      note: [{
        id: '1',
        date: '2018-05-01T00:00',
        author: 'Mr John Wils',
        text: 'Missing necessary information from the customer',
      }],
    };
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Return id, href, name, and notes', () => {
    const query: Operation[] = [
      {
        op: 'fields',
        path: "$['id','href','name','note']",
      },
    ];
    const expected = {
      id: '3180',
      href: 'https://host:port/troubleTicket/v2/troubleTicket/3180',
      name: 'Compliant over last bill',
      note: [
        {
          id: '1',
          date: '2018-05-01T00:00',
          author: 'Mr John Wils',
          text: 'Missing necessary information from the customer',
        },
        {
          id: '2',
          date: '2018-05-01T00:00',
          author: 'Mr Erika Xavy',
          text: "Information has been received, we're working on the resolution",
        },
        {
          id: '3',
          date: '2018-05-02T00:00',
          author: 'Mr Redfin Tekram',
          text: 'Issue has been resolved, the service has been restored',
        },
        {
          id: '4',
          date: '2018-05-02T00:00',
          author: 'Mr Redfin Tekram',
          text: 'Issue has been resolved, the service has been restored',
        },
        {
          id: '5',
          date: '2018-05-01T00:00',
          author: 'Mr Erika Xavy',
          text: "Information has been received, we're working on the resolution",
        },
      ],
    };
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('return id and href of all root objects when fields = none', () => {
    const query: Operation[] = [
      {
        op: 'fields',
        path: 'none',
      },
    ];
    const expected = [{
      id: '3180',
      href: 'https://host:port/troubleTicket/v2/troubleTicket/3180',
    }, {
      id: '6000',
      href: 'https://host:port/troubleTicket/v2/troubleTicket/6000',
    }];
    const result = JSONPathQuery.query(arrayDocument, query);
    expect(result).to.eql(expected);
  });
});

suite('TM Forum Examples - Filter', () => {
  test('Filter statusChange array based on string match', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: "statusChange[?(@.status=='Pending')]",
      },
    ];
    const expected = [
      {
        status: 'Pending',
        changeReason: 'Need more information from the customer',
        changeDate: '2018-05-01T00:00',
      },
    ];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Filter attachments for size equal to 300', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: 'attachment[?(@.size==300)]',
      },
    ];
    const expected = [
      {
        description: 'Scanned disputed December bill',
        href: 'http://hostname:port/documentManagement/v2/attachment/44',
        id: '44',
        url: 'http://xxxxx',
        name: 'December Bill',
        size: 300,
        sizeUnit: 'KB',
        '@referredType': 'Attachment',
      },
    ];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Filter status change where status is equal to "Pending"', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: "$.statusChange[?(@.status!='Pending')]",
      },
    ];
    const expected = [
      {
        status: 'InProgress',
        changeReason: 'Working on the issue resolution',
        changeDate: '2018-05-02T00:00',
      },
      {
        status: 'Resolved',
        changeReason: 'Issue has been resolved',
        changeDate: '2018-05-02T00:00',
      },
    ];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Filter attachments where no size is returned, should return empty', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: 'attachment[?(!@.size)]',
      },
    ];
    const expected: [] = [];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Filter by attachment size and unit', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: "$.attachment[?(@.size==300 && @.sizeUnit=='KB')]",
      },
    ];
    const expected = [
      {
        description: 'Scanned disputed December bill',
        href: 'http://hostname:port/documentManagement/v2/attachment/44',
        id: '44',
        url: 'http://xxxxx',
        name: 'December Bill',
        size: 300,
        sizeUnit: 'KB',
        '@referredType': 'Attachment',
      },
    ];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Filter notes - includes offset + limit', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: 'note[?(@.id>=2)]',
        limit: 2,
        offset: 1,
      },
    ];
    const expected = [
      {
        id: '3',
        date: '2018-05-02T00:00',
        author: 'Mr Redfin Tekram',
        text: 'Issue has been resolved, the service has been restored',
      },
      {
        id: '4',
        date: '2018-05-02T00:00',
        author: 'Mr Redfin Tekram',
        text: 'Issue has been resolved, the service has been restored',
      },
    ];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Filter notes - includes limit', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: 'note[?(@.id>=2)]',
        limit: 1,
      },
    ];
    const expected = [
      {
        id: '2',
        date: '2018-05-01T00:00',
        author: 'Mr Erika Xavy',
        text: "Information has been received, we're working on the resolution",
      },
    ];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Filter notes - includes offset', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: 'note[?(@.id>=2)]',
        offset: 3,
      },
    ];
    const expected = [
      {
        id: '5',
        date: '2018-05-01T00:00',
        author: 'Mr Erika Xavy',
        text: "Information has been received, we're working on the resolution",
      },
    ];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });
});

suite('TM Forum Examples - Filter + Fields + Sort', () => {
  test('Sort Notes by author in ascending order, filter notes with id >= 3, return fields: id, text, author', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: 'note[?(@.id>=3)]',
      },
      {
        op: 'fields',
        path: "$[*]['id','text','author']",
      },
      {
        op: 'sort',
        path: 'note[*].author',
        order: 'asc',
      },
    ];
    const expected = [
      {
        id: '5',
        author: 'Mr Erika Xavy',
        text: "Information has been received, we're working on the resolution",
      },
      {
        id: '3',
        author: 'Mr Redfin Tekram',
        text: 'Issue has been resolved, the service has been restored',
      },
      {
        id: '4',
        author: 'Mr Redfin Tekram',
        text: 'Issue has been resolved, the service has been restored',
      },
    ];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });

  test('Sort Notes by author in descending order, filter notes with id <= 4, return fields: id, text WITHOUT AUTHOR', () => {
    const query: Operation[] = [
      {
        op: 'filter',
        path: 'note[?(@.id<=4)]',
      },
      {
        op: 'fields',
        path: "$[*]['id','text']",
      },
      {
        op: 'sort',
        path: 'note[*].author',
        order: 'desc',
      },
    ];
    const expected = [
      {
        id: '3',
        text: 'Issue has been resolved, the service has been restored',
      },
      {
        id: '4',
        text: 'Issue has been resolved, the service has been restored',
      },
      {
        id: '1',
        text: 'Missing necessary information from the customer',
      },
      {
        id: '2',
        text: "Information has been received, we're working on the resolution",
      },
    ];
    const result = JSONPathQuery.query(simpleDocument, query);
    expect(result).to.eql(expected);
  });
});