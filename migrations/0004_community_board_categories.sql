UPDATE boards
SET name = '일반 게시물',
    description = '팬들이 자유롭게 인사하고 감상을 나누는 기본 게시판입니다.',
    sort_order = 2
WHERE slug = 'free';

INSERT OR IGNORE INTO boards (slug, name, description, sort_order) VALUES
  ('request', '듣고 싶은 곡', '듣고 싶은 장르, 전개, 악기, 애니 장면 아이디어를 제안합니다.', 3),
  ('mood', '분위기 제안', '새벽, 심해, 전투, 이별처럼 곡의 정서와 배경을 함께 모읍니다.', 4),
  ('feedback', '감상 후기', '공개된 곡, 영상, 가사, 시리즈에 대한 의견을 남기는 공간입니다.', 5);

UPDATE boards SET sort_order = 90 WHERE slug = 'media';
UPDATE boards SET sort_order = 91 WHERE slug = 'event';
