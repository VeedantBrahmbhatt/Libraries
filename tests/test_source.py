import pytest

from libraries_data.source import iter_oai_rows, parse_oai_page

OAI_HEADER = (
    '<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" '
    'xmlns:dc="http://purl.org/dc/elements/1.1/" '
    'xmlns:oaire="https://raw.githubusercontent.com/rcic/openaire4/master/schemas/4.0/oaire.xsd" '
    'xmlns:oapen="http://purl.org/dc/elements/1.1/" '
    'xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/">'
)


def _page(content: str, token: str = "", expected: int = 2) -> bytes:
    return (
        OAI_HEADER
        + "<ListRecords>"
        + content
        + f'<resumptionToken completeListSize="{expected}">{token}</resumptionToken>'
        + "</ListRecords></OAI-PMH>"
    ).encode()


BOOK = """
<record><header><identifier>oai:directory.doabooks.org:20.500.12854/123</identifier></header>
<metadata><oai_dc:dc>
<dc:title>Éducation et société</dc:title>
<dc:title>Education and Society</dc:title>
<dc:creator>Anne Example</dc:creator><dc:creator>山田 太郎</dc:creator>
<dc:subject>learning</dc:subject><dc:subject>thema EDItEUR::Education</dc:subject>
<dc:description>Un livre sur la société.</dc:description>
<dc:date type="Issued">2024</dc:date><oaire:resourceType>book</oaire:resourceType>
<dc:alternateIdentifier type="ISBN">9781111111111</dc:alternateIdentifier>
<dc:identifier type="DOI">10.1234/test</dc:identifier>
<dc:identifier type="URL">https://directory.doabooks.org/handle/20.500.12854/123</dc:identifier>
<dc:identifier>https://example.org/book.pdf</dc:identifier>
<dc:language>fre</dc:language><dc:publisher>Example Press</dc:publisher>
<oaire:licenseCondition uri="https://creativecommons.org/licenses/by/4.0/">
CC BY</oaire:licenseCondition>
</oai_dc:dc></metadata></record>
"""

DELETED = """
<record><header status="deleted">
<identifier>oai:directory.doabooks.org:20.500.12854/456</identifier>
</header></record>
"""


def test_parse_oai_page_maps_book_fields_and_deleted_record():
    page = parse_oai_page(_page(BOOK + DELETED, token="next"))

    assert page.next_token == "next"
    assert page.expected_size == 2
    assert len(page.rows) == 2
    book = page.rows[0]
    assert book["id"] == "20.500.12854/123"
    assert book["dc.type"] == "book"
    assert book["dc.title"] == "Éducation et société"
    assert book["dc.title.alternative"] == ["Education and Society"]
    assert book["dc.contributor.author"] == ["Anne Example", "山田 太郎"]
    assert book["dc.subject.other"] == ["learning"]
    assert book["dc.subject.classification.description"] == ["thema EDItEUR::Education"]
    assert book["dc.date.issued"] == "2024"
    assert book["oapen.identifier.doi"] == "10.1234/test"
    assert book["BITSTREAM_ISBN"] == ["9781111111111"]
    assert book["BITSTREAM_Download_URL"] == "https://example.org/book.pdf"
    assert book["BITSTREAM_License"] == "https://creativecommons.org/licenses/by/4.0/"
    assert page.rows[1]["dc.type"] == "deleted"


def test_iter_oai_rows_follows_resumption_tokens_and_checks_count():
    calls = []
    pages = {None: _page(BOOK, token="next"), "next": _page(DELETED)}

    def fetch(token):
        calls.append(token)
        return pages[token]

    rows = list(iter_oai_rows(fetch))
    assert calls == [None, "next"]
    assert len(rows) == 2


def test_iter_oai_rows_rejects_truncated_harvest():
    with pytest.raises(ValueError, match="incomplete"):
        list(iter_oai_rows(lambda token: _page(BOOK, expected=2)))
