from io import StringIO

import pytest

from libraries_data.source import parse_csv


def test_parse_csv_requires_identity_title_and_type_columns():
    rows = list(parse_csv(StringIO("id,dc.type,dc.title\n1,book,Example\n")))
    assert rows == [{"id": "1", "dc.type": "book", "dc.title": "Example"}]

    with pytest.raises(ValueError, match="Missing required DOAB columns"):
        list(parse_csv(StringIO("id,dc.title\n1,Example\n")))
